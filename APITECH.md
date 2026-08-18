# Sotto API — High-Level Design

This document describes how the Sotto API works and the small vocabulary it understands.

Sotto is built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

The goal is simple: **give Sotto what is happening, give it the rules, and get a No back.**

## 1. The API shape

Sotto always works with four main pieces:

```text
id
 ↓
type
 ↓
context
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

`context` is where the useful information lives.

It is intentionally flexible. Sotto does not decide whether something is a pull request, payment, job, customer request, product, message, or anything else.

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

The same API works for both.

---

## 3. Rules

Rules live inside `context.rules`.

Users do **not** need to know how to write these rules.

The Sotto UI lets them describe what they want in normal language. Sotto translates that into the JSON format below.

They can then edit the JSON themselves if they want to.

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

The JSON is the actual format Sotto evaluates. Natural language is only used to help create it.

---

## 4. Operators

Sotto starts with a small set of operators that can cover many different uses without creating a huge language.

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

Rules can be joined with:

| Word | Meaning |
|---|---|
| `all` | every rule must match |
| `any` | at least one rule must match |
| `not` | reverse the result |

These operators are fixed. The values and field names are flexible.

---

## 5. Decision

A rule can return a decision.

For the Sotto No flow, the normal decision is:

```json
"decision": "no"
```

The decision is separate from the response text.

The response is the short message Sotto returns with the decision.

Example:

```json
{
  "decision": "no",
  "response": "Not this time."
}
```

---

## 6. Response

Responses should stay short and fun, like NaaS.

Sotto's generated responses should normally be **4–15 words**.

Users can edit the response if they do not like it.

The response schema does not change:

```json
"response": "Not this time, I'm already too busy."
```

---

## 7. Translation

The UI can use AI to translate a person's normal language into Sotto's JSON.

For example:

```text
"Only accept jobs over $200 from new customers."
```

becomes structured JSON using Sotto's known vocabulary and operators.

The AI does not get to invent the API format.

Sotto validates the generated JSON against the fixed schema before using it.

If the JSON is invalid or contains an unsupported operator, it is rejected instead of being guessed at.

Users can fix the JSON themselves in the editor.

---

## 8. Deterministic evaluation

Once Sotto has valid JSON, the actual check does not need an AI model.

Sotto evaluates the same input using the same operators and rules.

```text
context
   +
rules
   ↓
validate
   ↓
evaluate
   ↓
decision + response
```

The AI helps create the rules. It does not secretly change the decision each time the API is called.

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

It does not contain the rules.

Sotto does not use the API key to find or load a saved rule set.

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

The vocabulary should grow only when a real use case needs it. We should not turn Sotto into a large general-purpose rules platform.
