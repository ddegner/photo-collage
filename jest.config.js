const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config.js' );

/*
 * Claude Code checks auxiliary worktrees out under .claude/worktrees/, which
 * puts a second copy of package.json and tests/ on disk. Jest otherwise reports
 * a haste-map collision and runs those duplicate suites alongside the real ones.
 */
module.exports = {
	...defaultConfig,
	modulePathIgnorePatterns: [ '<rootDir>/.claude/', '<rootDir>/build/' ],
	testPathIgnorePatterns: [ '/node_modules/', '<rootDir>/.claude/' ],
};
