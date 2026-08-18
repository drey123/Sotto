# Sotto

> **Need to say no? Let Sotto handle it.**

Sotto is a tiny API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

NaaS gives you a random No.

Sotto lets you make your own rules, then use them through an API.

## How it works

```text
NaaS
 ↓
Sotto
 ↓
Tell Sotto what you want
 ↓
Sotto turns it into JSON
 ↓
Edit it if you want
 ↓
Test it
 ↓
Use it through the API
```

That's it.

## The API

Send Sotto an `id`, a `type`, some `context`, and your rules.

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "time": "18:30",
    "urgent": false
  },
  "rules": {}
}
```

Sotto checks it and gives you:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "I'm busy before 9pm."
}
```

You can send one request or a whole bunch at once.

## Make your own rules

Don't feel like writing JSON?

Just tell Sotto what you want in plain English.

For example:

> Say no to pull requests before 9pm unless they're urgent.

Sotto turns that into JSON you can edit yourself.

You can also skip the UI and write the JSON yourself.

## Your rules stay yours

Sotto doesn't store them.

Send them whenever you use the API.

Your API key is only for using Sotto and keeping track of your usage.

## Classic NaaS

Still want the original random No?

```http
GET /no
```

Same old NaaS magic.

---

Built on [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service).
