# Sotto API — High-Level Design

Sotto is a tiny API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

The idea is simple: **give Sotto what someone wants and the context needed to evaluate it, and get a No back.**

## 1. The API shape

Every request has three things:

```text
id + type + context
        ↓
      Sotto
        ↓
id + type + decision + response
```

### Input

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "text": "Say no to pull requests before 9pm unless they're urgent.",
    "rules": [
      {
        "when": {
          "all": [
            { "field": "time", "operator": "lt", "value": "21:00" },
            { "field": "urgent", "operator": "eq", "value": false }
          ]
        },
        "decision": "no",
        "response": "I'm busy before 9pm."
      }
    ]
  }
}
```

`text` is the original instruction. `rules` are the structured representation of that instruction.

The context may also contain any data needed by those rules when the request is evaluated. Sotto does not define domain-specific fields.

### Output

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "I'm busy before 9pm."
}
```

`id` and `type` are returned so the response can be matched to the original request. Sotto does not store the `id`.

---

## 2. Context

`context` is intentionally flexible and domain-agnostic.

It can describe anything the caller needs Sotto to evaluate: a pull request, payment, job, customer request, product, message, or something else.

The important distinction is:

```text
text  → what the person said
rules → Sotto's structured understanding of it
other context data → information the rules evaluate
```

Sotto does not require a predefined list of fields.

For example, one request might use:

```json
"context": {
  "text": "Say no when the price is below $200.",
  "price": 150,
  "rules": []
}
```

Another might use:

```json
"context": {
  "text": "Say no if the tests are failing.",
  "tests_passed": false,
  "rules": []
}
```

Fields belong to the caller's context, not to Sotto's built-in vocabulary.

---

## 3. Rules

Rules live inside `context.rules`.

Users do not need to write them by hand.

The Sotto UI lets someone describe what they want in normal language. An LLM translates that text into Sotto's fixed JSON rule language.

The user can review and edit the generated JSON before using it.

The LLM does not create new operators or change the API shape.

The engine validates the rules before evaluation.

---

## 4. Sotto's small vocabulary

Sotto uses a fixed vocabulary so the JSON stays predictable while the context stays flexible.

### Operators

| Operator | Meaning |
|---|---|
| `eq` | equals |
| `neq` | does not equal |
| `gt` | greater than |
| `gte` | greater than or equal to |
| `lt` | less than |
| `lte` | less than or equal to |
| `in` | is one of these values |
| `contains` | contains a value |
| `exists` | exists |

### Logic

| Word | Meaning |
|---|---|
| `all` | everything inside must match |
| `any` | at least one must match |
| `not` | reverses the result |

The vocabulary is fixed. Fields and values are flexible.

---

## 5. Decision

Sotto's normal decision is:

```json
"decision": "no"
```

When no rule matches, Sotto returns:

```json
"decision": "none"
```

`no` means a rule decided No.

`none` means no rule matched.

The decision is separate from the response.

---

## 6. Response

Responses are short and fun, in the spirit of NaaS.

Generated responses should normally be **4–15 words**.

Users can edit the response without changing the response schema.

```json
"response": "Not this time, I'm already too busy."
```

---

## 7. Translation

The Sotto UI can use an LLM to translate normal language into Sotto JSON.

For example:

```text
Say no to anyone under 18.
```

The resulting rule could be:

```json
{
  "when": {
    "field": "age",
    "operator": "lt",
    "value": 18
  },
  "decision": "no",
  "response": "You need to be 18 or older."
}
```

The LLM translates the meaning into Sotto's known fields, operators, values, and rule structure. It cannot invent new Sotto operators or change the API shape.

The generated JSON is validated before it can be used.

If it is invalid or uses something Sotto does not support, Sotto rejects it rather than guessing.

Users can edit the rules themselves when needed.

---

## 8. Deterministic evaluation

Once the rules are valid, the final decision does not need an LLM.

```text
context + rules
      ↓
   validate
      ↓
   evaluate
      ↓
 decision + response
```

The LLM helps translate what someone means. Sotto validates and evaluates the resulting rules.

---

## 9. Single request

```http
POST /v1/check
```

The caller sends an `id`, `type`, and `context`.

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "text": "Say no to pull requests before 9pm unless they're urgent.",
    "time": "18:30",
    "urgent": false,
    "rules": [
      {
        "when": {
          "all": [
            { "field": "time", "operator": "lt", "value": "21:00" },
            { "field": "urgent", "operator": "eq", "value": false }
          ]
        },
        "decision": "no",
        "response": "I'm busy before 9pm."
      }
    ]
  }
}
```

Response:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "I'm busy before 9pm."
}
```

---

## 10. Batch requests

```http
POST /v1/check/batch
```

A batch contains multiple independent requests. Each item has its own `id`, `type`, and `context`.

```json
{
  "requests": [
    {
      "id": "pr-123",
      "type": "pull_request",
      "context": {
        "text": "Say no to non-urgent pull requests before 9pm.",
        "urgent": false,
        "rules": []
      }
    },
    {
      "id": "pr-124",
      "type": "pull_request",
      "context": {
        "text": "Say no when tests are failing.",
        "tests_passed": false,
        "rules": []
      }
    }
  ]
}
```

Each item gets its own result. One invalid item should not make the other items impossible to process; the batch response should identify errors per item.

---

## 11. API keys

The API key is only for authentication, rate limits, usage, and payment tracking.

It does not contain rules and is not used to find rules.

A user can have up to **3 API keys at once**.

---

## 12. No database for rules

Sotto does not need to store a user's rules to run the API.

The rules travel with the request inside `context.rules`.

This keeps Sotto simple and stateless.

The software using Sotto decides when to call it.

Sotto does not need cron jobs, webhooks, queues, or schedules to make a decision.

---

## 13. Classic NaaS

Sotto keeps the original NaaS-style endpoint:

```http
GET /no
```

This stays simple and random.

Rule-based Sotto is the useful layer built on top.

---

## 14. Design principles

Sotto should stay:

- Simple
- Small
- Domain-agnostic
- API-first
- Stateless
- Easy to understand
- Fun enough to feel like NaaS

The vocabulary should stay small and only grow when a real use case needs something it cannot express.
