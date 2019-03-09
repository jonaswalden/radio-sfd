module.exports = {
	env: {
		mocha: true
	},
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 8,
  },
	globals: {
		Feature: false,
		feature: false,
		Scenario: false,
		scenario: false,
		Given: false,
		given: false,
		When: false,
		when: false,
		Then: false,
		then: false,
		And: false,
		and: false,
	}
};