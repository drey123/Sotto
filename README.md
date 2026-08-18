# Sotto

> **Need to say no? Let Sotto handle it.**

Sotto is a tiny API built on top of [No-as-a-Service (NaaS)](https://github.com/hotheadhacker/no-as-a-service).

NaaS gives you a random No.

Sotto lets you describe what you want in normal language, turns it into a small set of rules, and lets you use those rules through an API.

## How it works

```text
NaaS
 ↓
Sotto
 ↓
Tell Sotto what you want
 ↓
Sotto turns it into JSON rules
 ↓
Edit them if you want
 ↓
Use them through the API
```

That's it.

## The API

Every request has an `id`, a `type`, and a `context`.

The context can contain the original `text` and the rules Sotto understood from it.

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "context": {
    "text": "Say no to pull requests before 9pm unless they're urgent.",
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
  }
}
```

The `text` is what the person said. The `rules` are Sotto's structured understanding of it.

When the API is called, the caller supplies the information the rules need to evaluate. Sotto does not store it.

A successful response is always predictable:

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

Just tell Sotto what you want in normal language.

For example:

> Say no to pull requests before 9pm unless they're urgent.

Sotto turns that into rules you can review and edit.

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
