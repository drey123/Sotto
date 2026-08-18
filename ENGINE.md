# Sotto Engine

This document defines how Sotto validates the structured rules produced from a user's text.

Sotto is built on top of NaaS. The user-facing model stays deliberately small:

```text
context
 ├── text
 └── rules
```

## 1. The flow

```text
User text
   ↓
  LLM
   ↓
 Rules
   ↓
 Review / edit
   ↓
 Validate
   ↓
 Sotto
   ↓
 decision + response
```

The LLM helps translate what a person means into Sotto's fixed rule language. It does not define that language and it does not get to invent new operators.

## 2. `text` and `rules`

### `text`

The original natural-language instruction.

```json
"text": "Say no to anyone under 18."
```

### `rules`

Sotto's structured representation of what the text means.

```json
"rules": [
  {
    "when": {
      "field": "age",
      "operator": "lt",
      "value": 18
    },
    "decision": "no",
    "response": "You need to be 18 or older."
  }
]
```

The important distinction is simple:

```text
text  = what the person said
rules = what Sotto understood it to mean
```

We do not expose separate concepts such as `intent`, `facts`, or a domain-specific context schema.

## 3. What the engine validates

The engine checks:

- The request has `id`, `type`, and `context`.
- `context.text` is present and valid.
- `context.rules` is valid.
- Every rule has the correct shape.
- Every operator is supported.
- Every logic word is supported.
- Values are valid for the selected operator.
- A decision is valid.
- A response is valid.

If validation fails, Sotto does not guess. It returns an error.

## 4. Fixed vocabulary

### Operators

```text
eq
neq
gt
gte
lt
lte
in
contains
exists
```

### Logic

```text
all
any
not
```

These words belong to Sotto.

The LLM can use them, and a user can edit them, but neither can invent another operator and expect Sotto to understand it.

## 5. Fields and values

Fields are not a predefined Sotto dictionary.

They are the structured names extracted from the user's text.

For example:

```text
"Say no to anyone under 18."
```

can become:

```json
{
  "field": "age",
  "operator": "lt",
  "value": 18
}
```

`age` is not a special Sotto field. It is simply the field the LLM determined was relevant to the user's words.

Likewise, `price`, `time`, `country`, `urgent`, `pull_request`, or anything else can appear when the text requires it.

## 6. Rule shape

A rule has:

```json
{
  "when": {},
  "decision": "no",
  "response": "Not this time."
}
```

`when` represents the part of the user's instruction that determines when the rule applies.

`decision` is the result associated with that rule.

`response` is the short message associated with that result.

## 7. Value types

Sotto uses normal JSON value types:

```text
string
number
boolean
null
array
object
```

Operators define what types they accept.

For example:

- `gt`, `gte`, `lt`, `lte` → comparable values.
- `contains` → strings or arrays.
- `in` → a list of possible values.
- `eq`, `neq` → compatible values.
- `exists` → field presence.

Dates and times remain JSON strings with defined formats.

The exact semantics of each operator are fixed by Sotto, not by the LLM.

## 8. Logic

### `all`

Everything inside must apply.

```json
{
  "all": [
    { "field": "time", "operator": "gte", "value": "21:00" },
    { "field": "urgent", "operator": "eq", "value": false }
  ]
}
```

### `any`

At least one item must apply.

```json
{
  "any": [
    { "field": "urgent", "operator": "eq", "value": true },
    { "field": "priority", "operator": "eq", "value": "high" }
  ]
}
```

### `not`

Reverses another expression.

`not` can contain another expression, including `all`, `any`, or another `not`.

## 9. Multiple rules

Rules are ordered.

**The first applicable rule wins.**

There is no hidden priority system.

If two rules express different outcomes for the same situation, their order determines which rule is considered first.

## 10. `no` and `none`

Sotto has two important results:

```text
no   → a rule produced No
none → no rule applies
```

`none` is deliberately different from `no` so software using Sotto can tell the difference between:

> “Sotto said No.”

and:

> “Sotto did not find an applicable rule.”

## 11. Validation boundary

There are two validation stages.

### Shape validation

Does the JSON follow Sotto's schema?

### Rule validation

Does the JSON use Sotto's vocabulary and valid operator/value combinations?

Both must pass before Sotto accepts the rules.

The engine validates the structured rules. It does not attempt to reinterpret the original English text after the LLM has produced the rules.

## 12. No hidden translation

The engine does not silently rewrite a user's rules.

It does not:

- invent an operator;
- invent a value;
- silently change a field;
- guess a missing meaning;
- turn unsupported syntax into something else.

If the rules cannot be understood using Sotto's fixed language, validation fails.

## 13. Error format

Validation errors use a predictable structure:

```json
{
  "error": {
    "code": "INVALID_RULE",
    "message": "Unknown operator: maybe",
    "path": "context.rules[0].when.operator"
  }
}
```

The main error fields are:

```text
code
message
path
```

## 14. Response

A rule carries its response with it:

```json
{
  "decision": "no",
  "response": "I'm busy before 9pm."
}
```

The response is not another rule language.

Generated responses should normally be **4–15 words**.

Users can edit the response while keeping the same response schema.

## 15. The engine stays small

Sotto owns:

- the rule schema;
- the vocabulary;
- the operators;
- validation;
- rule evaluation;
- the `no` / `none` result model.

Sotto does not own a dictionary of industries, applications, fields, or domains.

That is how the same small rule language can represent many different things without creating a different schema for every use case.
