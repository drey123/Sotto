# Sotto Rule Coverage Benchmark

This research harness measures how much of the useful rule space can be represented by Sotto's current fixed vocabulary.

It is deliberately separate from the production engine/API.

## Sources

The initial corpus is mined from public open-source rule/policy projects and normalized into Sotto-shaped cases rather than copying their source code:

- CacheControl/json-rules-engine
- cedar-policy/cedar-examples, including its OOPSLA 2024 benchmark material
- Open Policy Agent examples/documentation
- Microsoft RulesEngine examples

Cedar's integration-test repository is especially useful because it already treats policy examples as executable test cases and recommends running the corpus in CI. Sotto borrows that testing discipline, not Cedar's policy language. See the source notes in `SOURCES.md`.

## Categories

Each case is classified as one of:

- `clean` — directly expressible with current Sotto operators/logic.
- `awkward` — expressible, but likely needs normalization/derived caller data or a less obvious composition.
- `new_operator` — genuinely requires a general-purpose primitive that Sotto does not currently have.
- `caller_data` — the rule is expressible once the caller supplies a derived value.
- `ambiguous` — natural language is not precise enough to decide without clarification.

The benchmark does **not** automatically add operators. It produces evidence for deciding whether a new general-purpose operator is justified.

## Run

```bash
python research/rule-coverage/engine.py
```

The GitHub Actions workflow runs the same command on every push/PR affecting this research directory.
