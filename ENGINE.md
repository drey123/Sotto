# Sotto Engine

This document defines how Sotto validates and evaluates the JSON it receives.

Sotto is built on top of NaaS. The context is flexible and can be about anything. Sotto's rule language stays small and fixed.

## 1. The flow

```text
text
 ↓
LLM
 ↓
rules
 ↓
user review / edit
 ↓
validation
 ↓
context + rules
 ↓
evaluation
 ↓
decision + response
```

The LLM helps translate what a person means. It does not make the final decision.

## 2. The three important pieces

### `text`

The original natural-language instruction.

Example:

```json
"text": "Say no to anyone under 18."
```

### `rules`

Sotto's structured representation of what that text means.

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

### Other context data

The information available when the rules are evaluated.

```json
"age": 17
```

The distinction is:

```text
text  = what the person said
rules = Sotto's structured understanding of it
data  = what the rule evaluates
```

Sotto does not require predefined domain fields.

## 3. What the engine validates

The engine checks:

- The request has `id`, `type`, and `context`.
- `context.rules` is valid.
- Every rule has the correct shape.
- Every operator is supported.
- Every logic word is supported.
- Values can be used with the selected operator.
- Fields used by a rule can be evaluated against the supplied context.
- A decision and response are valid.

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

These words are controlled by Sotto. An LLM or user cannot create a new operator and expect the engine to understand it.

## 5. Flexible context

Sotto does not have a fixed list of fields.

A caller can supply any JSON data needed by its rules.

For example:

```json
{
  "text": "Say no if the tests are failing.",
  "tests_passed": false,
  "rules": []
}
```

Or:

```json
{
  "text": "Say no to orders below $200.",
  "order": {
    "total": 150
  },
  "rules": []
}
```

Fields such as `age`, `price`, `time`, `urgent`, and `tests_passed` are not Sotto fields. They belong to the caller's context.

## 6. Context values vs rule values

A context value is the actual information available for evaluation.

A rule value is the value the rule compares against.

For example:

```json
"age": 17
```

with:

```json
{
  "field": "age",
  "operator": "lt",
  "value": 18
}
```

means:

```text
17 < 18 → match
```

The `17` is not part of the intent. It is the current data.

The `18` is part of the rule because it came from the instruction "under 18."

## 7. Rule shape

A rule has:

```json
{
  "when": {},
  "decision": "no",
  "response": "Not this time."
}
```

`when` describes when the rule matches.

`decision` tells Sotto what to return.

`response` is the short message returned with the decision.

## 8. Value types

Sotto uses normal JSON value types rather than creating a separate type system.

Supported JSON values are:

```text
string
number
boolean
null
array
object
```

Operators decide which types they can work with.

- `gt`, `gte`, `lt`, `lte` work with comparable values such as numbers.
- `contains` works with strings and arrays.
- `in` uses an array of possible values.
- `eq` and `neq` compare compatible values.
- `exists` checks whether a field is present.

Dates and times are represented as strings with defined formats.

## 9. Multiple rules

Rules are evaluated in the order they are supplied.

**The first matching rule wins.**

```text
rule 1 → match → return it
rule 2 → never reached
```

There is no hidden priority system.

## 10. Missing fields

If a rule references a field that is not present in the context, that rule does not match.

Sotto does not invent or guess missing values.

Use `exists` when the presence of a field itself matters.

## 11. Nested fields

Nested fields are supported using a path:

```text
customer.age
customer.address.country
order.total
```

For example:

```json
"customer": {
  "age": 17
}
```

can be evaluated with:

```json
{
  "field": "customer.age",
  "operator": "lt",
  "value": 18
}
```

## 12. Arrays

Arrays are normal context values.

```json
"tags": ["vip", "new"]
```

`contains` can test whether an array contains a value:

```json
{
  "field": "tags",
  "operator": "contains",
  "value": "vip"
}
```

`in` can test whether a context value is one of a supplied list:

```json
{
  "field": "country",
  "operator": "in",
  "value": ["NG", "GH", "KE"]
}
```

## 13. Logic

### `all`

Every item must match.

### `any`

At least one item must match.

### `not`

Reverses the result of another expression.

`not` can contain another expression, including `all`, `any`, or another `not`.

## 14. Operator meaning

| Operator | Meaning |
|---|---|
| `eq` | equal |
| `neq` | not equal |
| `gt` | greater than |
| `gte` | greater than or equal to |
| `lt` | less than |
| `lte` | less than or equal to |
| `in` | value is in a supplied list |
| `contains` | a value contains an item |
| `exists` | a field exists in the context |

An operator with an incompatible value type is invalid. The engine rejects it instead of guessing.

## 15. Validation boundary

There are two checks:

### Shape validation

Is this valid Sotto JSON?

### Meaning validation

Can Sotto actually evaluate what this JSON is asking against the supplied context?

Both must pass before evaluation begins.

The engine validates the structured rules, not the original English text. The text is preserved for the user and for traceability; the rules are the machine-readable representation Sotto evaluates.

## 16. No hidden decisions

The engine does not invent missing information.

It does not silently change an operator, invent a field value, or guess what the user meant.

If the rules cannot be evaluated safely using Sotto's fixed language, validation fails.

## 17. Multiple matches and `none`

The first matching rule wins.

If no rule matches, that is different from a rule deciding `no`.

Sotto returns:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "none",
  "response": "No rule matched."
}
```

`no` means a rule intentionally returned No.

`none` means no rule matched.

## 18. Error format

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

## 19. Response

When a rule matches, Sotto returns:

```json
{
  "id": "pr-123",
  "type": "pull_request",
  "decision": "no",
  "response": "I'm busy before 9pm."
}
```

The response is not used to decide whether a rule matches.

It is the message returned after the decision is made.

Generated responses should normally be **4–15 words**. Users can edit the response without changing the response schema.

## 20. Implementation rule

The engine should be small and predictable.

It should not contain domain-specific fields such as `age`, `price`, `pull_request`, or `customer` as built-in concepts.

Those come from the context supplied by the caller.

Sotto owns the rule language. The caller owns the data.
