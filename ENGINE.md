# Sotto Engine

This document defines how Sotto validates the structured rules produced from a user's text.

Sotto is built on top of NaaS. The user-facing model stays deliberately small:

```text
context
 ├── text
 └── rules[]
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
 decision + response + rule_id
```

The LLM helps translate what a person means into Sotto's fixed rule language. It does not define that language and it does not get to invent new operators.

## 2. `text` and `rules`

### `text`

The original natural-language instruction.

```json
"text": "Reject before 9pm unless urgent, and always reject blocked users."
```

### `rules[]`

Sotto's structured representation of what the text means.

One text can contain multiple pieces of intent, so one text can produce multiple rules.

```json
"rules": [
  {
    "id": "rule_1",
    "when": {
      "all": [
        { "field": "time", "operator": "lt", "value": "21:00" },
        { "field": "urgent", "operator": "eq", "value": false }
      ]
    },
    "decision": "no",
    "response": "Not before 9pm unless it's urgent."
  },
  {
    "id": "rule_2",
    "when": {
      "field": "blocked",
      "operator": "eq",
      "value": true
    },
    "decision": "no",
    "response": "Blocked users aren't accepted."
  }
]
```

The important distinction is simple:

```text
text  = what the person said
rules = what Sotto understood it to mean
```

We do not expose separate concepts such as `intent`, `facts`, or a domain-specific context schema.

## 3. Rule identity

Every rule has an explicit `id`.

The rule ID is stable for that version of the rules and is returned when that rule produces the result.

For example:

```json
{
  "id": "rule_1",
  "when": { "field": "age", "operator": "lt", "value": 18 },
  "decision": "no",
  "response": "You need to be 18 or older."
}
```

The result can identify it with:

```json
"rule_id": "rule_1"
```

Do not use `context.rules.1` or array position as a permanent rule identifier. Reordering or editing rules can change positions.

The caller can version or replace its own rule set however it wants. Sotto does not store rule versions.

## 4. Naming

Sotto uses **snake_case** for multi-word JSON keys:

```text
rule_id
pull_request
api_key
```

It does not use camelCase such as `ruleId` or `apiKey`.

This convention is fixed across the API.

## 5. Helping users create JSON

Users should not have to remember the entire schema.

The UI should guide them through:

```text
natural language
      ↓
     LLM
      ↓
valid Sotto JSON
      ↓
user reviews / edits
      ↓
     API
```

The important pieces can be shown as:

```text
id
type
context.text
context.rules[]
context.rules[].id
```

For rules, the editor can expose the fixed vocabulary instead of asking users to remember it:

```text
field
operator
value
all
any
not
decision
response
```

Advanced users can edit the JSON directly.

The UI should generate unique rule IDs automatically. Users should not need to invent IDs unless they want to edit the raw JSON themselves.

## 6. What the engine validates

The engine checks:

- The request has `id`, `type`, and `context`.
- `context.text` is present and valid.
- `context.rules` is valid.
- Every rule has a valid `id`.
- Every rule has the correct shape.
- Every operator is supported.
- Every logic word is supported.
- Values are valid for the selected operator.
- A decision is valid.
- A response is valid.

If validation fails, Sotto does not guess. It returns an error.

## 7. Fixed vocabulary

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

## 8. Fields and values

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

## 9. Rule shape

A rule has:

```json
{
  "id": "rule_1",
  "when": {},
  "decision": "no",
  "response": "Not this time."
}
```

`when` represents the part of the user's instruction that determines when the rule applies.

`decision` is the result associated with that rule.

`response` is the short message associated with that result.

## 10. Value types

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

## 11. Logic

### `all`

Everything inside must apply.

### `any`

At least one item must apply.

### `not`

Reverses another expression.

`not` can contain another expression, including `all`, `any`, or another `not`.

## 12. Multiple rules

Rules are independent. Their IDs are the durable identifiers, and array position has no semantic meaning.

Each rule is evaluated independently. Multiple rules from the same `context.rules[]` can match the same request.

If no rule matches, the result is `decision: "none"`.

If one rule matches, Sotto returns that rule's `rule_id`, `decision`, and `response` using the normal response shape.

If multiple rules match, Sotto does not silently choose one based on array position or assign an implicit priority. The API must identify the matching rules so the caller can decide how to use them in its own automation.

The caller decides what to automate from the returned result. Sotto does not execute automation.

## 13. `no` and `none`

Sotto has two important results:

```text
no   → a rule produced No
none → no rule applies
```

`none` is deliberately different from `no` so software using Sotto can tell the difference between:

> “Sotto said No.”

and:

> “Sotto did not find an applicable rule.”

## 14. Validation boundary

There are two validation stages.

### Shape validation

Does the JSON follow Sotto's schema?

### Rule validation

Does the JSON use Sotto's vocabulary and valid operator/value combinations?

Both must pass before Sotto accepts the rules.

The engine validates the structured rules. It does not attempt to reinterpret the original English text after the LLM has produced the rules.

## 15. No hidden translation

The engine does not silently rewrite a user's rules.

It does not:

- invent an operator;
- invent a value;
- silently change a field;
- guess a missing meaning;
- turn unsupported syntax into something else.

If the rules cannot be understood using Sotto's fixed language, validation fails.

## 16. Error format

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

## 17. Response

A rule carries its response with it:

```json
{
  "decision": "no",
  "response": "I'm busy before 9pm."
}
```

When it matches, Sotto returns the request `id`, request `type`, the rule's `rule_id`, its `decision`, and its `response`.

The response is not another rule language.

Generated responses should normally be **4–15 words**.

Users can edit the response while keeping the same response schema.

## 18. The engine stays small

Sotto owns:

- the rule schema;
- the vocabulary;
- the operators;
- validation;
- rule evaluation;
- the `no` / `none` result model;
- rule identity in the response.

Sotto does not own a dictionary of industries, applications, fields, or domains.

That is how the same small rule language can represent many different things without creating a different schema for every use case.
