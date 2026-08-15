# Code Style

Applies to every JavaScript file in this repository. There is no TypeScript here.

## Semicolons
- No trailing semicolons.
- When a semicolon is required for syntax safety, put it at the start of the line.

```js
const value = getValue()
;(() => init())()
```

Some older lines still carry trailing semicolons. Leave them unless you are already
editing that line — new and rewritten code follows the rule.

## Modules
- Browser-native ES modules only: `import` / `export`, always with the `.js` extension
  in the specifier. There is no bundler to resolve extensionless paths.
- Each service and controller exports a single object gathering its public functions;
  everything else stays module-private.

## Structure
- Function declarations, not arrow consts, for top-level module functions.
- The exported object goes near the top of the file, above the implementations.
- Controllers touch the DOM. Services do not — keep `document` and `window.game` out of
  `js/services/`.
- Calls run one way: `index.html → window.game → controller → service`. Never wire a
  service function onto `window.game`, and never call a service from an inline handler.
  The controller exists to catch the failure and report it.
- Services throw on failure. Swallowing an error inside a service hides it from the
  controller, which is the only layer that can tell the user.

## Comments
- Comment the **why**, not the what — especially for a non-obvious ordering, a guard, or
  a workaround. The existing comments are the model: short, one line, above the code
  they explain.
- Do not add comments that restate the function name.

Match the surrounding code for everything this file does not cover.
