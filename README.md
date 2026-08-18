# Sotto

> **Say what you want. Set the rules. Get the API.**

Sotto is a simple API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

Sotto keeps the simple idea of NaaS and adds a way to create rules that your software can use again and again.

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

Sotto lets you describe what you want in simple words. It turns that into rules you can edit and test. Once you are happy with the rules, Sotto gives you an API that your software can use to get the same decision every time.

## API

Base URL:

```text
https://api.sotto.no/v1
```

### Check one request

```http
POST /check
```

```json
{
  "input": {
    "type": "meeting",
    "time": "19:00",
    "urgency": "normal"
  }
}
```

Response:

```json
{
  "decision": "no",
  "reason": "I'm off after five.",
  "rule": "after-hours"
}
```

### Check many requests

```http
POST /check/batch
```

```json
{
  "inputs": [
    {
      "id": "1",
      "type": "meeting",
      "time": "19:00"
    },
    {
      "id": "2",
      "type": "meeting",
      "time": "14:00"
    }
  ]
}
```

Response:

```json
{
  "results": [
    {
      "id": "1",
      "decision": "no",
      "reason": "I'm off after five.",
      "rule": "after-hours"
    },
    {
      "id": "2",
      "decision": "yes"
    }
  ]
}
```

The same locked rules are used for every request.

### Classic NaaS

Sotto also keeps the original NaaS-style endpoint:

```http
GET /no
```

It returns a random, fun response like the original NaaS.

## API keys

Each user starts with one API key.

A user can have up to **3 API keys at the same time**. They can create a new key and delete an old one when needed.

The API key identifies the user, their rules, and their usage.

---

**Built on [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service).**
