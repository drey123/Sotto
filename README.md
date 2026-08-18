# Sotto

> **Say what you want. Set the rules. Get the API.**

Sotto is a simple API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

Sotto keeps the simple idea of NaaS and adds a way to create rules that software can use again and again.

## How it works

```text
NaaS
 ↓
Sotto UI
 ↓
User describes what they want
 ↓
Sotto proposes rules
 ↓
User edits rules
 ↓
User tests rules
 ↓
User locks/version them
 ↓
Sotto gives them an API
 ↓
Their software sends individual or bulk requests
 ↓
Deterministic decisions come back
```

## What Sotto does

Sotto helps turn what you want into rules you can edit and test. Once the rules are ready, Sotto gives you an API that your software can use to get the same decision every time.

The caller provides the context. Sotto evaluates that context against the locked rules and returns a fixed response format.

Sotto does not decide what the caller should do next. The caller's software can use the response however it wants.

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

The `context` can contain whatever information the caller needs. Sotto does not require a specific domain such as GitHub, payments, hiring, or meetings.

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
- `decision` — the deterministic result
- `response` — the short response created or edited by the user

Sotto does not store or create the caller's `id`. It returns it so the caller can match the response to the original request.

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
      "decision": "yes",
      "response": "Looks good to me."
    }
  ]
}
```

The same locked rules are used for every request in the batch.

## API keys

Each user starts with one API key.

A user can have up to **3 API keys at the same time**. They can create a new key and delete an old one when needed.

The API key identifies the user, their rules, and their usage.

## Classic NaaS

Sotto also keeps the original NaaS-style endpoint:

```http
GET /no
```

It returns a random, fun response like the original NaaS.

---

**Built on [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service).**
