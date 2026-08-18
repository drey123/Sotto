import unittest

from engine import validate_expression, validate_rule


class CoverageEngineTests(unittest.TestCase):
    def test_simple_operator(self):
        self.assertEqual(
            validate_expression({"field": "age", "operator": "gte", "value": 18}), []
        )

    def test_nested_logic(self):
        expression = {
            "all": [
                {"field": "amount", "operator": "gte", "value": 10},
                {"not": {"field": "blocked", "operator": "eq", "value": True}},
            ]
        }
        self.assertEqual(validate_expression(expression), [])

    def test_reject_unknown_operator(self):
        errors = validate_expression({"field": "name", "operator": "starts_with", "value": "A"})
        self.assertTrue(any("unsupported operator" in error for error in errors))

    def test_rule_requires_identity_and_response(self):
        errors = validate_rule(
            {"when": {"field": "age", "operator": "lt", "value": 18}, "decision": "no"},
            0,
        )
        self.assertTrue(any(".id" in error for error in errors))
        self.assertTrue(any(".response" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
