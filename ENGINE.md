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

The engine cares about the values and the rule used against them, not what the field is called.

## 5. Rule shape

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

## 6. A simple rule

```json
{
  "when": {
    "field": "price",
    "operator": "lt",
    "value": 200
  },
  "decision": "no",
  "response": "That is below my minimum."
}
```

The engine reads this as:

```text
price < 200
```

If it matches, the rule returns its decision and response.

## 7. Multiple rules

Rules are evaluated in the order they are supplied.

The engine should use a clear and predictable rule-selection method. This needs to be defined before implementation so two matching rules can never produce an unclear result.

## 8. Logic

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

```json
{
  "not": {
    "field": "urgent",
    "operator": "eq",
    "value": true
  }
}
```

## 9. Operator meaning

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

The exact value types accepted by each operator should be fixed before implementation.

## 10. Validation boundary

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

The engine should reject it instead of guessing.

## 11. No hidden decisions

The engine does not invent missing information.

It does not silently change an operator, convert an unknown field, or guess what the user meant.

If the request cannot be evaluated safely using Sotto's fixed language, it fails validation.

## 12. Response

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

## 13. What still needs to be decided

Before implementation, we need to lock down:

- Exact value types for every operator.
- How missing fields behave.
- How nested fields work.
- How arrays are handled.
- How multiple matching rules are handled.
- How conflicting rules are handled.
- Whether `not` can contain any rule expression.
- The exact error format.

These should be agreed on before code is written.
