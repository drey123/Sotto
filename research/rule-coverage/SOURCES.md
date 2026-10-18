# Benchmark Sources

The benchmark uses public open-source projects as **source material for rule patterns**. We normalize the meaning into Sotto's own JSON rather than copying implementation code or policy files wholesale.

| Source | What we mine | Why |
|---|---|---|
| CacheControl/json-rules-engine | condition/operator tests, `all`/`any` behavior, fact comparisons, event/rule examples | Broad JSON rule-engine vocabulary and executable examples |
| cedar-policy/cedar-examples | application policies and OOPSLA 2024 benchmark scenarios | Real authorization policies and a public benchmark corpus |
| cedar-policy/cedar-integration-tests | policy + request + expected-decision test shape | Strong model for executable corpus tests in CI |
| Open Policy Agent (OPA) | policy examples and data-driven evaluation patterns | Domain-agnostic rules over caller-provided data |
| Microsoft RulesEngine | workflow/rule examples and expression patterns | Business-rule use cases and rule composition |

Important: source projects remain their authors' work and licenses. This repository records normalized Sotto test cases and provenance, not copied source implementations.

## External references

- https://github.com/CacheControl/json-rules-engine
- https://github.com/cedar-policy/cedar-examples
- https://github.com/cedar-policy/cedar-integration-tests
- https://github.com/open-policy-agent/opa
- https://github.com/microsoft/RulesEngine

Cedar integration tests explicitly describe executable policy/request corpora and recommend using them in CI. Cedar's examples repository also contains the OOPSLA 2024 benchmark material. Those practices are directly relevant to how this Sotto benchmark should be maintained.
