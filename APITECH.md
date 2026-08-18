# Sotto API — High-Level Design

Sotto is a tiny API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

The idea is simple: **give Sotto what is happening and how you want it handled, and get a No back.**

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
    "time": "18:30",
    "urgent": false,
    "rules": []
  }
}
```

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

Sotto does not decide what the context is about. It could be a pull request, payment, job, customer request, product, message, or anything else.

For example:

```json
"context": {
  "price": 150,
  "customer": "new",
  "stock": 0,
  "rules": []
}
```

Or:

```json
"context": {
  "files_changed": 12,
  "tests_passed": false,
  "author": "john",
  "rules": []
}
```

The field names and values can change completely from one use case to another.

`rules` is simply the part of the context that tells Sotto what should happen.

---

## 3. Rules

Rules live inside `context.rules`.

Users do **not** need to know how to write them.

The Sotto UI lets someone describe what they want in normal language. An LLM turns that into the JSON format below.

They can edit the JSON if they want to, but they don't have to write it themselves.

Example:

> Say no to pull requests before 9pm unless they're urgent.

Can become:

```json
"rules": [
  {
    "when": {
      "all": [
        {
          "field": "time",
          "operator": "lt",
          "value": "21:00"
        },
        {
          "field": "urgent",
          "operator": "eq",
          "value": false
        }
      ]
    },
    "decision": "no",
    "response": "I'm busy before 9pm."
  }
]
```

The JSON is what Sotto evaluates. The LLM only helps turn what someone means into Sotto JSON.

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

The vocabulary is fixed. The fields and values are not.

This means Sotto can work with very different kinds of information without creating a new API for every use case.

---

## 5. Decision

Sotto is built around the No flow, so the normal decision is:

```json
"decision": "no"
```

The decision is separate from the response.

The response is the short message that goes with the No.

```json
{
  "decision": "no",
  "response": "Not this time."
}
```

---

## 6. Response

Responses should stay short and fun, like NaaS.

Generated responses should normally be **4–15 words**.

Users can edit the response if they don't like it.

The response shape never changes:

```json
"response": "Not this time, I'm already too busy."
```

---

## 7. Translation

The Sotto UI can use an LLM to turn normal language into Sotto JSON.

For example:

```text
Only accept jobs over $200 from new customers.
```

The LLM translates the meaning into Sotto's known fields, operators, values, and rule structure.

It cannot invent new Sotto operators or change the API shape.

The generated JSON is validated before it can be used.

If it is invalid or uses something Sotto does not support, Sotto rejects it rather than guessing.

Users can edit the JSON themselves when needed.

---

## 8. Deterministic evaluation

Once the JSON is valid, the final decision does not need an LLM.

Sotto uses the same operators and the same rule structure every time.

```text
context + rules
      ↓
   validate
      ↓
   evaluate
      ↓
 decision + response
```

The LLM helps translate what someone means. Sotto evaluates the result.

---

## 9. Single request

```http
POST /v1/check
```

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "time": "18:30",
    "urgent": false,
    "rules": []
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

A batch contains multiple requests. Each request has its own `id`, `type`, and `context`.

```json
{
  "requests": [
    {
      "id": "pr-123",
      "type": "pull_request",
      "context": {
        "urgent": false,
        "rules": []
      }
    },
    {
      "id": "pr-124",
      "type": "pull_request",
      "context": {
        "urgent": true,
        "rules": []
      }
    }
  ]
}
```

Each request gets its own response.

---

## 11. API keys

The API key is only for using Sotto, rate limits, and usage/payment tracking.

It does not contain the rules and is not used to find them.

A user can have up to **3 API keys at once**.

---

## 12. No database for rules

Sotto does not need to store someone's rules to run the API.

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
