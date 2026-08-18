# Sotto API — High-Level Design

Sotto is a tiny API built on top of No-as-a-Service (NaaS).

The idea is simple: **give Sotto what someone wants and get a predictable No back.**

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
    "text": "Reject before 9pm unless urgent, and always reject blocked users.",
    "rules": [
      {
        "id": "rule_1",
        "when": {
          "all": [
            { "field": "time", "operator": "lt", "value": "21:00" },
            { "field": "urgent", "operator": "eq", "value": false }
          ]
        },
        "decision": "no",
        "response": "Not before 9pm unless it's urgent."
      },
      {
        "id": "rule_2",
        "when": {
          "field": "blocked",
          "operator": "eq",
          "value": true
        },
        "decision": "no",
        "response": "Blocked users aren't accepted."
      }
    ]
  }
}
```

`text` is the original instruction.

`rules` are Sotto's structured understanding of that instruction.

A single `text` can produce multiple rules. Each rule gets its own stable `id` so software using Sotto can identify a result without depending on array position.

These are the two things Sotto needs from the user's meaning. Sotto does not require a second user-defined data model beside them.

### Output

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "Not before 9pm unless it's urgent.",
  "rule_id": "rule_1"
}
```

`id` and `type` are returned so the caller can match the result to its own request. `rule_id` identifies which rule produced the result. Sotto does not store any of these identifiers.

The caller decides what to do with the result. Sotto does not provide or run the caller's automation.

---

## 2. Context

`context` is the container for the two pieces above:

```text
context
 ├── text
 └── rules
```

`text` is what the person said.

`rules` are what Sotto understood that text to mean in its fixed rule language.

Sotto does not expose separate concepts such as `intent`, `facts`, or a predefined domain schema.

---

## 3. Rules

Rules live inside `context.rules`.

Users do not need to write them by hand.

The Sotto UI lets someone describe what they want in normal language. An LLM translates that text into Sotto's fixed JSON rule language.

A single text can contain several pieces of intent and therefore produce several rules.

The user can review and edit the generated JSON before using it. They can also write or edit the JSON themselves.

Each rule has an explicit `id`.

Use `rule_id` in the response to identify the matching rule. Do not use `context.rules.1` or array position as a permanent identifier because editing or reordering rules can change positions.

The LLM does not create new operators or change the API shape.

The engine validates the rules before evaluation.

---

## 4. Naming

Sotto uses **snake_case** for multi-word JSON keys:

```text
rule_id
pull_request
api_key
```

It does not use camelCase such as:

```text
ruleId
apiKey
```

The API's naming convention is fixed and should be followed consistently.

---

## 5. Helping users create the JSON

Users should not have to understand the entire schema before they can use Sotto.

The UI should guide them through:

```text
natural language
      ↓
     LLM
      ↓
valid Sotto JSON
      ↓
user reviews / edits
      ↓
     API
```

The UI can show the important pieces clearly:

```text
id
 type
 context.text
 context.rules
 context.rules[].id
```

For rules, the editor can expose the fixed vocabulary instead of asking users to remember it:

```text
field
operator
value
all
any
not
decision
response
```

Advanced users can edit the JSON directly.

The user does not need to know that a rule is internally represented as `rules[0]`, `rules[1]`, etc. The stable rule identifier is what should be used when referring to a rule outside the JSON.

---

## 6. Sotto's small vocabulary

Sotto uses a fixed vocabulary so the JSON stays predictable while the meaning of `text` can be flexible.

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

The vocabulary is fixed. The LLM works within it.

---

## 7. Decision

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

## 8. Response

Responses are short and fun, in the spirit of NaaS.

Generated responses should normally be **4–15 words**.

Users can edit the response without changing the response schema.

```json
"response": "Not this time, I'm already too busy."
```

---

## 9. Translation

The Sotto UI can use an LLM to translate normal language into Sotto JSON.

For example:

```text
Say no to anyone under 18.
```

The LLM can represent that intent as:

```json
{
  "id": "rule_1",
  "when": {
    "field": "age",
    "operator": "lt",
    "value": 18
  },
  "decision": "no",
  "response": "You need to be 18 or older."
}
```

The LLM translates the meaning into Sotto's fixed rule structure. It cannot invent new Sotto operators or change the API shape.

The generated JSON is validated before it can be used.

If it is invalid or uses something Sotto does not support, Sotto rejects it rather than guessing.

Users can edit the rules themselves when needed.

---

## 10. Deterministic evaluation

Once the rules are valid, the final result does not need an LLM.

```text
text + rules
     ↓
  validate
     ↓
  evaluate
     ↓
decision + response + rule_id
```

The LLM helps translate what someone means. Sotto validates and evaluates the resulting rules.

The caller decides what to automate from the result.

---

## 11. Single request

```http
POST /v1/check
```

The caller sends an `id`, `type`, and `context`.

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "text": "Reject before 9pm unless urgent.",
    "rules": [
      {
        "id": "rule_1",
        "when": {
          "all": [
            { "field": "time", "operator": "lt", "value": "21:00" },
            { "field": "urgent", "operator": "eq", "value": false }
          ]
        },
        "decision": "no",
        "response": "Not before 9pm unless it's urgent."
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
  "response": "Not before 9pm unless it's urgent.",
  "rule_id": "rule_1"
}
```

---

## 12. Batch requests

```http
POST /v1/check/batch
```

A batch contains multiple independent requests. Each item has its own `id`, `type`, and `context`.

A request can also contain multiple rules. These are separate concepts:

```text
batch
 ├── request 1 → text + rules[]
 ├── request 2 → text + rules[]
 └── request 3 → text + rules[]
```

Each item gets its own result. A result identifies its matched rule with `rule_id`.

---

## 13. API keys

The API key is only for authentication, rate limits, usage, and payment tracking.

It does not contain rules and is not used to find rules.

A user can have up to **3 API keys at once**.

---

## 14. No database for rules

Sotto does not need to store a user's rules to run the API.

The rules travel with the request inside `context.rules`.

This keeps Sotto simple and stateless.

The software using Sotto decides when to call it.

Sotto does not need cron jobs, webhooks, queues, or schedules.

---

## 15. Classic NaaS

Sotto keeps the original NaaS-style endpoint:

```http
GET /no
```

This stays simple and random.

Rule-based Sotto is the useful layer built on top.

---

## 16. Design principles

Sotto should stay:

- Simple
- Small
- Domain-agnostic
- API-first
- Stateless
- Easy to understand
- Fun enough to feel like NaaS

The vocabulary should stay small and only grow when a real use case needs something it cannot express.
