#!/usr/bin/env python3
"""Deterministic research engine for measuring Sotto rule coverage.

This is a research harness, not the production Sotto API. It validates that
normalized rules use the current Sotto vocabulary and reports corpus coverage.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORPUS = ROOT / "corpus.json"

OPERATORS = {"eq", "neq", "gt", "gte", "lt", "lte", "in", "contains", "exists"}
LOGIC = {"all", "any", "not"}
DECISIONS = {"no", "none"}
CATEGORIES = {"clean", "awkward", "new_operator", "caller_data", "ambiguous"}


def validate_atom(atom: dict, path: str) -> list[str]:
    errors: list[str] = []
    if not isinstance(atom, dict):
        return [f"{path}: expression must be an object"]
    if "field" not in atom:
        errors.append(f"{path}.field: missing")
    if not isinstance(atom.get("field"), str) or not atom.get("field"):
        errors.append(f"{path}.field: must be a non-empty string")
    op = atom.get("operator")
    if op not in OPERATORS:
        errors.append(f"{path}.operator: unsupported operator {op!r}")
    if "value" not in atom:
        errors.append(f"{path}.value: missing")
    if op == "in" and "value" in atom and not isinstance(atom["value"], list):
        errors.append(f"{path}.value: in requires an array")
    return errors


def validate_expression(expr: object, path: str = "when") -> list[str]:
    if not isinstance(expr, dict):
        return [f"{path}: expression must be an object"]

    logic_keys = [key for key in expr if key in LOGIC]
    atom_keys = {"field", "operator", "value"} & set(expr)

    if logic_keys and atom_keys:
        return [f"{path}: cannot mix a logic node with an atom"]

    if not logic_keys:
        return validate_atom(expr, path)

    if len(logic_keys) != 1:
        return [f"{path}: exactly one logic operator is allowed"]

    logic = logic_keys[0]
    child = expr[logic]

    if logic in {"all", "any"}:
        if not isinstance(child, list) or not child:
            return [f"{path}.{logic}: must be a non-empty array"]
        errors: list[str] = []
        for index, item in enumerate(child):
            errors.extend(validate_expression(item, f"{path}.{logic}[{index}]"))
        return errors

    return validate_expression(child, f"{path}.not")


def validate_rule(rule: object, index: int) -> list[str]:
    path = f"rules[{index}]"
    if not isinstance(rule, dict):
        return [f"{path}: rule must be an object"]
    errors: list[str] = []
    if not isinstance(rule.get("id"), str) or not rule.get("id"):
        errors.append(f"{path}.id: required")
    if "when" not in rule:
        errors.append(f"{path}.when: required")
    else:
        errors.extend(validate_expression(rule["when"], f"{path}.when"))
    if rule.get("decision") not in {"no"}:
        errors.append(f"{path}.decision: research cases currently expect 'no'")
    if not isinstance(rule.get("response"), str) or not rule.get("response"):
        errors.append(f"{path}.response: required")
    return errors


def validate_case(case: dict) -> list[str]:
    if case.get("category") not in CATEGORIES:
        return [f"{case.get('id')}: unknown category"]
    if case.get("rule") is None:
        if case.get("category") != "new_operator":
            return [f"{case.get('id')}: null rule is only allowed for new_operator cases"]
        return []
    return validate_rule(case["rule"], 0)


def load_cases() -> list[dict]:
    with CORPUS.open(encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    cases = load_cases()
    errors: list[str] = []
    counts = {category: 0 for category in CATEGORIES}
    represented = 0

    for case in cases:
        category = case["category"]
        counts[category] += 1
        case_errors = validate_case(case)
        if case_errors:
            errors.extend(case_errors)
        elif case.get("rule") is not None:
            represented += 1

    total = len(cases)
    coverage = represented / total if total else 0.0

    print(f"Sotto rule coverage benchmark")
    print(f"Cases: {total}")
    print(f"Validated normalized rules: {represented}")
    print(f"Representability: {coverage:.1%}")
    print("Categories:")
    for category, count in counts.items():
        print(f"  {category:13} {count}")

    if errors:
        print("\nVALIDATION ERRORS")
        for error in errors:
            print(f"- {error}")
        return 1

    print("\nAll normalized Sotto rules are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
