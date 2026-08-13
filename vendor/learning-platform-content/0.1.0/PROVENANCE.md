# learning-platform-content 0.1.0

These browser and Node assets are vendored from `@learning-platform/content`
commit `339bbf6878dba2322f3ef208889505b1e495f27d`
(`chore: rebuild dist for the public API and sanitisation surface`).
They are kept in a versioned directory so this static GitHub Pages hub has no
runtime dependency on GitHub or npm and can be rolled back with its own
reviewed commit.

The JavaScript files are unmodified build outputs. `LICENSE` and `schemas/` are
copied from the same commit.

Hub-local learner adapters remain in `content/engine/` (`state.js`, `submit.js`,
`interactive.js`). Teaching copy stays in `content/unit-14/`.
