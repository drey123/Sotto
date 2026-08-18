# Sotto Engine

This document defines how Sotto validates and evaluates the JSON it receives.

Sotto is built on top of NaaS. The context can be about anything, but the language Sotto uses for rules stays small and fixed.

## 1. The flow

```text
Context + rules
      ↓
   Validate
      ↓
   Evaluate
      ↓
 decision + response
```

An LLM may help turn normal language into Sotto JSON. The engine does not trust that JSON automatically.

## 2. What the engine validates

The engine checks:

- The request has `id`, `type`, and `context`.
- `context.rules` is valid.
- Every rule has the correct shape.
- Every operator is supported.
- Every logic word is supported.
- Values can be used with the selected operator.
- Fields used by a rule are available in the context.
- A decision and response are valid.

If validation fails, Sotto does not guess. It returns an error.

## 3. Fixed vocabulary

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

## 4. Flexible context

Sotto does not have a fixed list of fields.

This is valid:

```json
{
  "context": {
    "age": 31,
    "price": 200,
    "customer": "new",
    "rules": []
  }
}
```

This is also valid:

```json
{
  "context": {
    "tests_passed": false,
    "files_changed": 12,
    "author": "john",
    "rules": []
  }
}
```

Fields such as `age`, `price`, `time`, `urgent`, or `tests_passed` are **not Sotto fields**. They belong to the caller's context.

The engine cares about the values and the rule used against them, not what a field is called.

## 5. Context vs rule values

The context contains the information about the thing being evaluated.

```json
"context": {
  "age": 31,
  "price": 150,
  "country": "NG",
  "rules": []
}
```

The rule contains the value that the context is compared against.

```json
{
  "field": "age",
  "operator": "gte",
  "value": 18
}
```

This means:

```text
context.age >= 18
```

So `age: 31` belongs in the context when it describes the current request. `18` belongs in the rule because it is the value the rule is testing against.

The same field can be used with different rule values:

```text
context.age >= 18
context.age < 65
context.age in [18, 21, 30]
```

Sotto does not decide what a field means. The caller supplies the context, and the rule describes how to evaluate it.

## 6. Rule shape

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

## 7. A simple rule

```json
{
  "when": {
    "field": "age",
    "operator": "lt",
    "value": 18
  },
  "decision": "no",
  "response": "You need to be 18 or older."
}
```

The engine reads this as:

```text
context.age < 18
```

If it matches, the rule returns its decision and response.

## 8. Value types

Sotto uses normal JSON value types rather than creating a separate type system.

Supported context values are:

```text
string
number
boolean
null
array
object
```

Operators decide which value types they can work with.

For example:

- `gt`, `gte`, `lt`, `lte` work with comparable values such as numbers.
- `contains` works with strings and arrays.
- `in` uses an array of possible values.
- `eq` and `neq` compare compatible values.
- `exists` checks whether a field is present.

Dates and times are represented as strings with defined formats rather than creating a separate date type.

The exact comparison behavior will be defined by the operator rules below before implementation.

## 9. Multiple rules

Rules are evaluated in the order they are supplied.

**The first matching rule wins.**

```text
rule 1 → match → return it
rule 2 → never reached
```

This makes rule priority simple: put the more important rule first.

There is no hidden priority system.

## 10. Missing fields

If a rule references a field that is not present in the context, that rule does not match.

For example:

```json
"context": {
  "price": 100,
  "rules": []
}
```

and:

```json
{
  "field": "age",
  "operator": "gt",
  "value": 18
}
```

The rule does not match because `age` is not present.

Use `exists` when the presence of a field itself matters.

Sotto does not invent or guess missing values.

## 11. Nested fields

Nested fields are supported using a path:

```text
customer.age
customer.address.country
order.total
```

For example:

```json
"context": {
  "customer": {
    "age": 31
  },
  "rules": []
}
```

A rule can use:

```json
{
  "field": "customer.age",
  "operator": "gte",
  "value": 18
}
```

The same missing-field behavior applies to nested paths.

## 12. Arrays

Arrays are normal context values.

For example:

```json
"context": {
  "tags": ["vip", "new"],
  "rules": []
}
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

Operators must keep these meanings consistent instead of changing behavior based on the caller's domain.

## 13. Logic

### all

Every item must match.

```json
{
  "all": [
    { "field": "urgent", "operator": "eq", "value": false },
    { "field": "price", "operator": "lt", "value": 200 }
  ]
}
```

### any

At least one item must match.

```json
{
  "any": [
    { "field": "urgent", "operator": "eq", "value": true },
    { "field": "price", "operator": "gte", "value": 200 }
  ]
}
```

### not

The result is reversed.

`not` can contain another rule expression, including an `all`, `any`, or another `not` expression.

```json
{
  "not": {
    "field": "urgent",
    "operator": "eq",
    "value": true
  }
}
```

## 14. Operator meaning

Operators have one meaning and must behave the same every time.

| Operator | Meaning |
|---|---|
| `eq` | equal |
| `neq` | not equal |
| `gt` | greater than |
| `gte` | greater than or equal |
| `lt` | less than |
| `lte` | less than or equal |
| `in` | value is in a supplied list |
| `contains` | a value contains an item |
| `exists` | a field exists in the context |

An operator with an incompatible value type is invalid. The engine rejects it instead of guessing.

## 15. Validation boundary

There are two different checks:

### Shape validation

Is this valid Sotto JSON?

### Meaning validation

Can Sotto actually evaluate what this JSON is asking?

Both must pass before evaluation begins.

For example, this is valid JSON:

```json
{
  "field": "price",
  "operator": "gt",
  "value": "banana"
}
```

But if the supplied context has a numeric `price`, the value type does not make sense for `gt`.

The engine rejects it instead of guessing.

## 16. No hidden decisions

The engine does not invent missing information.

It does not silently change an operator, convert an unknown field, or guess what the user meant.

If the request cannot be evaluated safely using Sotto's fixed language, it fails validation.

## 17. Multiple matches and `none`

The first matching rule wins.

If no rule matches, that is different from a rule deciding `no`.

Sotto returns a distinct `none` result:

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

This lets software handle errors without parsing human text.

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

## 20. Implementation rule

The engine should be small and predictable.

It should not contain domain-specific fields such as `age`, `price`, `pull_request`, or `customer` as built-in concepts.

Those come from the context supplied by the caller.

Sotto owns the rule language. The caller owns the data.
