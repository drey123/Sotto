# Initial Benchmark Report

This is the first executable baseline, not a final statistical claim about all possible rule use cases.

## Corpus

44 normalized cases are currently included:

- 10 from json-rules-engine patterns
- 8 from Cedar examples/benchmark patterns
- 6 from OPA patterns
- 6 from Microsoft RulesEngine patterns
- 14 cross-domain cases used to probe caller-data and missing-operator boundaries

The source projects contain far more material. This branch establishes the mining/normalization format and CI harness first; additional source cases should be added without changing the evaluator merely to improve the number.

## Initial classification

- `clean`: 37
- `caller_data`: 6
- `new_operator`: 2
- `awkward`: 0
- `ambiguous`: 0

42/44 cases have a valid Sotto rule representation in the current corpus. The two `new_operator` cases are intentionally retained as failures rather than being forced into the existing vocabulary:

1. prefix matching
2. regular-expression matching

The 6 `caller_data` cases are intentionally counted as representable because the caller can provide the required derived fact (for example `requests_last_24h` or `days_since_refund_request`) and Sotto can then apply its existing comparisons.

## Important interpretation

The 95.5% figure is **not** a claim that Sotto covers 95.5% of the world's rules. The corpus is normalized by us and is not a random sample. It is a baseline for discovering repeated missing primitives and translation/data problems.

The next step is to expand the corpus from the actual source repositories, preserve provenance for every case, and watch whether the same missing operation appears repeatedly. Only then should an operator be proposed.
