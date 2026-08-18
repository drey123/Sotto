# Sotto

> **Say what you want. Set the rules. Get the API.**

Sotto is a simple API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

Sotto keeps the simple idea of NaaS and adds a way for software to use its own context and rules to get a consistent **No**.

## How it works

```text
NaaS
 ↓
Sotto UI
 ↓
User describes what they want
 ↓
Sotto turns it into JSON rules
 ↓
User edits the rules
 ↓
User tests the rules
 ↓
User locks the rules
 ↓
Sotto gives them an API
 ↓
Their software sends individual or bulk requests
 ↓
Sotto returns a deterministic No
```

## What Sotto does

Sotto helps turn what you mean into rules that can be edited, tested, and used again.

The rules are **not stored by Sotto**. The caller owns the rules and sends them with the request. Sotto is stateless: it evaluates the rules against the current context and returns the result.

The API key is only used for access, rate limits, and billing. It does not store or identify the caller's rules.

Sotto does not run jobs, schedules, webhooks, or other automation. The caller's software decides when to call Sotto and what to do with the response.

## API

Base URL:

```text
https://api.sotto.no/v1
```

### Check one request

```http
POST /check
```

Request:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "author": "john",
    "files_changed": 12,
    "tests_passed": false
  },
  "rules": {
    "rules": []
  }
}
```

The `context` is flexible. Sotto does not require a specific domain. It can contain whatever information the caller needs to evaluate.

The `rules` use Sotto's fixed rule format and can be created with the UI or written directly by the caller.

Response:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "Tests aren't passing yet."
}
```

The response always uses the same four fields:

- `id` — the caller's ID, returned unchanged
- `type` — the caller's request type
- `decision` — Sotto's deterministic decision
- `response` — the short response defined by the rule

Sotto does not create or store the caller's `id`. It returns it so the caller can match the response to the original request.

### Check many requests

```http
POST /check/batch
```

A batch request sends multiple `id`, `type`, and `context` objects using the same rules.

```json
{
  "rules": {
    "rules": []
  },
  "requests": [
    {
      "id": "pr-123",
      "type": "pull_request",
      "context": {
        "tests_passed": false
      }
    },
    {
      "id": "pr-124",
      "type": "pull_request",
      "context": {
        "tests_passed": true
      }
    }
  ]
}
```

Each request gets its own result.

## Rules

Sotto uses one fixed rule format. The context can be different for every use case, but the rule structure stays the same.

The first version uses a small set of deterministic operators:

```text
eq        equal
neq       not equal
gt        greater than
gte       greater than or equal
lt        less than
lte       less than or equal
in        is one of
contains  contains
exists    exists
```

Rules can combine conditions with:

```text
all
any
not
```

Sotto's AI helps translate natural language into this JSON. It does not make the final decision. The generated JSON is validated before it can be used.

Users can edit the generated JSON themselves, test it, and lock the version they want to use. The same rules can then be sent directly through the API without using the UI.

## API keys

The API key is for access, rate limits, and billing.

A user can have up to **3 API keys at the same time**. They can create a new key and delete an old one when needed.

The API key does not contain or store the user's rules.

## Classic NaaS

Sotto also keeps the original NaaS-style endpoint:

```http
GET /no
```

It returns a random, fun response like the original NaaS.

---

**Built on [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service).**
