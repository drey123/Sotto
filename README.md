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

The UI is mainly for creating, editing, and testing rules. Once the rules are ready, the API can be used directly by software without using the UI.

### Single request

```text
Your software
     ↓
 Sotto API
     ↓
 Your rules
     ↓
Deterministic decision
```

One request goes in and one decision comes back.

### Bulk request

```text
Your software
     ↓
 Sotto API
     ↓
 Many requests
     ↓
 Your rules
     ↓
Many deterministic decisions
```

Multiple requests can be sent together and checked against the same rules.

---

**Built on [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service).**
