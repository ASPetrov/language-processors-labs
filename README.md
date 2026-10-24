# Language Processors — Laboratory Exercises

Static HTML laboratories. Open a lab's `index.html` directly in a browser; no installation, build step, or web server is required. Keep the lab folders and `shared` together under the same parent folder.

- [Lab 1 — Language processors](lab1/index.html)
- [Lab 2 — Formal languages and grammars](lab2/index.html)
- [Lab 3 — Regular expressions, regular languages, and finite automata](lab3/index.html)
- [Lab 4 — STUDENT](lab4/index.html)
- [Lab 5 — Lexical analysis](lab5/index.html)

All labs load `shared/style.css`, which contains the common visual styles originally based on lab1. Changes to this file apply to every lab. Labs 3 and 5 also load their own `style.css` after the shared stylesheet for their interactive examples. All labs load `shared/script.js` for answer toggles and multiple-choice checks. Lab 3 then loads `lab3.js` for its automata and regular-expression exercises; lab 5 loads its own `script.js` for lexeme checks and the scanner. Labs 3 and 5 have no footer.

When copying or publishing an individual lab, include the sibling `shared` folder as well. For example, keep `lab3/index.html` and `shared/style.css` at those relative paths.

The repository root intentionally has no landing page. When publishing the root with GitHub Pages, link directly to each lab (for example, `lab3/index.html`) from Microsoft Teams Classwork.
