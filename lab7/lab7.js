"use strict";

(() => {
    const rules = {
        program: "(1) program : PROGRAM LBRACKET program_body RBRACKET",
        program_body: "(2) program_body : ( variable_definition SEMICOLON | function_definition )* main_function",
        main_function: "(3) main_function : 'main' LPAREN RPAREN ARROW VOID block",
        block: "(9) block : LBRACKET ( statement )* RBRACKET",
        statement: "(10) statement : simple_statement SEMICOLON | compound_statement",
        simple_statement: "(11) simple_statement : variable_definition | assignment | function_call | return_statement | print_statement | read_statement",
        print_statement: "(17) print_statement : PRINT LPAREN assignable ( COMMA assignable )* RPAREN",
        assignable: "(22) assignable : array_initialization | character_literal | string_literal | expression",
        string_literal: "(25) string_literal : DOUBLE_QUOTES ( CHAR_LITERAL )* DOUBLE_QUOTES",
    };

    function selectRule(button, container, detail, hint) {
        container.querySelectorAll("[data-rule]").forEach((node) => {
            const selected = node === button;
            node.classList.toggle("selected", selected);
            node.setAttribute("aria-pressed", String(selected));
        });
        const code = document.createElement("code");
        code.textContent = rules[button.dataset.rule];
        detail.replaceChildren(code);
        hint.hidden = true;
    }

    function clearRule(container, detail, hint) {
        container.querySelectorAll("[data-rule]").forEach((node) => {
            node.classList.remove("selected");
            node.setAttribute("aria-pressed", "false");
        });
        detail.replaceChildren();
        hint.hidden = false;
    }

    const derivation = document.getElementById("derivation");
    if (derivation) {
        const steps = [
            ["Стартов символ", "program"],
            ["Правило (1)", "PROGRAM { program_body }"],
            ["Правило (2), без глобални дефиниции", "PROGRAM { main_function }"],
            ["Правило (3)", "PROGRAM { main ( ) -> VOID block }"],
            ["Правило (9)", "PROGRAM { main ( ) -> VOID { statement } }"],
            ["Правило (10)", "PROGRAM { main ( ) -> VOID { simple_statement ; } }"],
            ["Правило (11)", "PROGRAM { main ( ) -> VOID { print_statement ; } }"],
            ["Правило (17)", "PROGRAM { main ( ) -> VOID { PRINT ( assignable ) ; } }"],
            ["Правило (22)", "PROGRAM { main ( ) -> VOID { PRINT ( string_literal ) ; } }"],
            ["Правило (25), терминали", 'program { main() -> void { print("Hello, world!"); } }'],
        ];
        let position = 0;
        const counter = document.getElementById("derivation-counter");
        const rule = document.getElementById("derivation-rule");
        const code = document.getElementById("derivation-code");
        const detail = document.getElementById("derivation-rule-detail");
        const hint = document.getElementById("derivation-hint");
        const prev = document.getElementById("derivation-prev");
        const next = document.getElementById("derivation-next");

        function render() {
            counter.textContent = `Стъпка ${position + 1} от ${steps.length}`;
            rule.textContent = steps[position][0];
            clearRule(code, detail, hint);
            const raw = steps[position][1];
            code.replaceChildren();
            if (position === steps.length - 1) {
                // The completed program contains terminals only, including the keyword program.
                code.textContent = raw;
                hint.hidden = true;
            } else {
                // Quoted literals remain plain text, even if they contain a nonterminal name.
                const parts = raw.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
                parts.forEach((part, index) => {
                    if (index % 2) {
                        code.append(document.createTextNode(part));
                        return;
                    }
                    part.split(/\b([a-z_][a-z_0-9]*)\b/g).forEach((token) => {
                        if (!Object.hasOwn(rules, token)) {
                            code.append(document.createTextNode(token));
                            return;
                        }
                        const button = document.createElement("button");
                        button.type = "button";
                        button.className = "derivation-nonterminal";
                        button.dataset.rule = token;
                        button.textContent = token;
                        button.title = "Покажи граматичното правило за " + token;
                        button.setAttribute("aria-pressed", "false");
                        code.append(button);
                    });
                });
            }
            prev.disabled = position === 0;
            next.disabled = position === steps.length - 1;
        }

        code.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-rule]");
            if (button) selectRule(button, code, detail, hint);
        });
        prev.addEventListener("click", () => {
            position = Math.max(0, position - 1);
            render();
        });
        next.addEventListener("click", () => {
            position = Math.min(steps.length - 1, position + 1);
            render();
        });
        document.getElementById("derivation-reset").addEventListener("click", () => {
            position = 0;
            render();
        });
        render();
    }

    const tree = document.getElementById("tree-view");
    if (tree) {
        const nodes = [...tree.querySelectorAll(".grammar-node")];
        const status = document.getElementById("tree-status");
        const detail = document.getElementById("tree-rule");
        const hint = document.getElementById("tree-hint");
        const next = document.getElementById("tree-next");
        const all = document.getElementById("tree-all");
        let step = 0;

        function update() {
            nodes.forEach((node, index) => {
                const children = node.querySelector(":scope > ul");
                if (children) children.hidden = index >= step;
            });
            status.textContent = `Разгърнати продукции: ${step} от ${nodes.length}.`;
            next.disabled = step === nodes.length;
            all.disabled = step === nodes.length;
            clearRule(tree, detail, hint);
        }

        next.addEventListener("click", () => {
            step = Math.min(step + 1, nodes.length);
            update();
        });
        all.addEventListener("click", () => {
            step = nodes.length;
            update();
        });
        document.getElementById("tree-reset").addEventListener("click", () => {
            step = 0;
            update();
        });
        tree.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-rule]");
            if (button) selectRule(button, tree, detail, hint);
        });
        update();
    }
})();
