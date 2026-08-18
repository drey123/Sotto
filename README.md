# Sotto

> **Say what you want. Set the rules. Get the API.**

Sotto is a simple API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

Sotto keeps the simple idea of NaaS and adds a way for software to use the caller's own context and rules to return a consistent **No**.

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
User locks/version them
 ↓
Sotto gives them an API
 ↓
Their software sends individual or bulk requests
 ↓
Sotto returns a deterministic No
```

## What Sotto does

Sotto helps turn what you mean into rules that can be edited, tested, and used again.

When the API is used, the caller sends an `id`, `type`, and flexible `context`. Sotto checks that context against the caller's locked rules and returns the same fixed response shape every time.

Sotto does not control what the caller's software does with the response. The caller can use it however they want.

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
  }
}
```

The `context` is flexible. Sotto does not require a specific domain. It can contain whatever information the caller needs to evaluate.

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
- `response` — the short response from the locked rule

Sotto does not create or store the caller's `id`. It returns it so the caller can match the response to the original request.

### Check many requests

```http
POST /check/batch
```

Request:

```json
{
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

Response:

```json
{
  "results": [
    {
      "id": "pr-123",
      "type": "pull_request",
      "decision": "no",
      "response": "Tests aren't passing yet."
    },
    {
      "id": "pr-124",
      "type": "pull_request",
      "decision": "no",
      "response": "I'm still saying no."
    }
  ]
}
```

The same locked rules are used for every request in the batch.

## Rules

Sotto uses one fixed rule format. The caller's context can be different for every use case, but the rule structure stays the same.

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

Sotto's AI helps translate natural language into this JSON. It does not change the rule format or make the final decision. The generated JSON is validated before it can be used.

Users can edit the generated JSON themselves, test it, and lock a version when they are happy with it.

## API keys

Each user starts with one API key.

A user can have up to **3 API keys at the same time**. They can create a new key and delete an old one when needed.

The API key identifies the user and their Sotto rules.

## Classic NaaS

Sotto also keeps the original NaaS-style endpoint:

```http
GET /no
```

It returns a random, fun response like the original NaaS.

---

**Built on [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service).**
