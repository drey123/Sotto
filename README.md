# Sotto

> **Need to say no? Let Sotto handle it.**

Sotto is a tiny API built on top of No-as-a-Service (NaaS).

NaaS gives you a random No.

Sotto lets you describe what you want, turns that into a small set of rules, and gives you a predictable response through an API.

## How it works

```text
You say what you want
        ↓
      text
        ↓
       LLM
        ↓
      rules
        ↓
   review / edit
        ↓
      Sotto
        ↓
 decision + response
```

That's it.

## The API

Every request has an `id`, a `type`, and a `context`.

The context contains the original `text` and the `rules` Sotto understood from it.

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "text": "Approve only pull requests after 9pm.",
    "rules": [
      {
        "when": {
          "field": "time",
          "operator": "gte",
          "value": "21:00"
        },
        "decision": "no",
        "response": "Not before 9pm."
      }
    ]
  }
}
```

`text` is what the person said.

`rules` are Sotto's structured understanding of what they said.

The rules are what Sotto validates and evaluates. A user can review or edit them before using them.

A successful response is predictable:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "Not before 9pm."
}
```

You can send one request or a whole batch.

## Make your rules

Don't feel like writing JSON?

Just tell Sotto what you want in normal language.

For example:

> Approve only pull requests after 9pm.

Sotto turns what you said into rules you can review and edit.

You can also write or edit the JSON yourself.

## Your rules stay yours

Sotto doesn't store them.

Send them whenever you use the API.

Your API key is for authentication, rate limits, usage, and payment tracking. It is not where your rules live.

## Classic NaaS

Still want the original random No?

```http
GET /no
```

Same old NaaS magic.

---

Built on No-as-a-Service (NaaS).
