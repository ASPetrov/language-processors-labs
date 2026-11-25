"use strict";

// The hierarchy and labels come from the lesson's existing tree markup.
(() => {
    const tree = document.getElementById("ast-tree");
    const info = document.getElementById("nodeInfo");
    if (!tree || !info) return;

    // STUDENT productions from lab7/student.html; rule 31 shows only the chosen alternative.
    const rules = {
        "1": "(1) program : PROGRAM LBRACKET program_body RBRACKET",
        "2": "(2) program_body : ( variable_definition SEMICOLON | function_definition )* main_function",
        "3": "(3) main_function : 'main' LPAREN RPAREN ARROW VOID block",
        "6": "(6) type : primitive_type | array_type",
        "7": "(7) primitive_type : INT | CHAR | BOOLEAN",
        "9": "(9) block : LBRACKET ( statement )* RBRACKET",
        "13": "(13) variable_definition : type assignment",
        "14": "(14) assignment : variable BECOMES assignable",
        "17": "(17) print_statement : PRINT LPAREN assignable ( COMMA assignable )* RPAREN",
        "20": "(20) while_statement : WHILE LPAREN expression RPAREN block",
        "22": "(22) assignable : array_initialization | character_literal | string_literal | expression",
        "26": "(26) expression : simple_expression | simple_expression relational_operator simple_expression",
        "27": "(27) simple_expression : signed_term ( ( additive_operator | OR ) signed_term )*",
        "30": "(30) factor : variable | \nINT_LITERAL | BOOLEAN_LITERAL | LPAREN expression RPAREN | function_call | array_length",
        "31": "(31, избрана алтернатива) relational_operator : LESS_THAN",
        "33": "(33) additive_operator : PLUS | MINUS",
        "35": "(35) variable : IDENTIFIER | index_variable"
    };

    const nodeTypes = {
        "program": {
            "role": "Корен на AST за цялата програма.",
            "rules": [
                1,
                2
            ],
            "ast": "Глобалните дефиниции и main са непосредствени наследници. Междинният program_body и служебните терминали PROGRAM, LBRACKET и RBRACKET не са отделни AST възли."
        },
        "variable definition": {
            "role": "Дефиниция на променлива.",
            "rules": [
                13
            ],
            "ast": "Двата наследника са типът и присвояването — съответстват на type и assignment."
        },
        "type: int": {
            "role": "Лист на AST за целочисления тип.",
            "rules": [
                6,
                7
            ],
            "ast": "Избрани са type → primitive_type и primitive_type → INT. В AST типът е представен с един възел type: int."
        },
        "assignment": {
            "role": "Присвояване на стойност.",
            "rules": [
                14,
                22
            ],
            "ast": "Първият наследник е променливата, а вторият — стойността или изразът от assignable. Терминалът BECOMES не е отделен възел."
        },
        "variable": {
            "role": "Лист на AST за използване на променлива.",
            "rules": [
                35
            ],
            "ast": "Тук е избрана алтернативата IDENTIFIER. Името i е стойност на идентификатора, а не име на нетерминал."
        },
        "integer": {
            "role": "Лист на AST за целочислена константа.",
            "rules": [
                30
            ],
            "ast": "Тук factor използва алтернативата INT_LITERAL. Числото е стойността на константата; междинните нетерминали на израза не са отделни възли."
        },
        "function: main": {
            "role": "Главна функция на програмата.",
            "rules": [
                3
            ],
            "ast": "Възелът запазва името main, резултатния тип void и тялото block. Скобите и стрелката не са отделни AST възли."
        },
        "void": {
            "role": "Лист на AST за резултатния тип на main.",
            "rules": [
                3
            ],
            "ast": "VOID е терминал в main_function, а не самостоятелен нетерминал. Тук е запазен като възел за резултатния тип."
        },
        "block": {
            "role": "Блок от оператори.",
            "rules": [
                9
            ],
            "ast": "Наследниците са AST възлите за операторите в блока. Междинните statement възли и ограждащите скоби не се показват отделно."
        },
        "while": {
            "role": "Цикличен оператор while.",
            "rules": [
                20
            ],
            "ast": "Двата непосредствени наследника са условието от expression и тялото block. В този пример условието е операцията less; WHILE, LPAREN и RPAREN не са отделни възли."
        },
        "less": {
            "role": "AST операция за сравнение „по-малко“.",
            "rules": [
                26,
                31
            ],
            "ast": "Името less не е граматичен нетерминал. Операцията съответства на сравнението между двете simple_expression с избран оператор LESS_THAN; двата AST наследника са операндите."
        },
        "print": {
            "role": "Оператор за извеждане.",
            "rules": [
                17
            ],
            "ast": "Аргументите от assignable ( COMMA assignable )* са групирани в AST възела actual parameters. PRINT, скобите и запетаите не са отделни възли."
        },
        "actual parameters": {
            "role": "AST група за аргументите на print в този пример.",
            "rules": [
                17
            ],
            "ast": "Този възел групира списъка assignable ( COMMA assignable )* от print_statement. Тук не се прилага отделно actual_parameters от правило (21); неговото използване в граматиката е при function_call."
        },
        "addition": {
            "role": "AST операция за събиране.",
            "rules": [
                27,
                33
            ],
            "ast": "Името addition не е граматичен нетерминал. В simple_expression е избран additive_operator → PLUS; двата AST наследника са операндите на събирането."
        }
    };

    function code(text) {
        const element = document.createElement("code");
        element.textContent = text;
        return element;
    }

    tree.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-node]");
        if (!button || !tree.contains(button)) return;

        tree.querySelectorAll("button[data-node]").forEach((node) => {
            const selected = node === button;
            node.classList.toggle("selected", selected);
            node.setAttribute("aria-pressed", String(selected));
        });

        const path = [];
        let item = button.closest("li");
        while (item && tree.contains(item)) {
            path.unshift(item.querySelector(":scope > button[data-node]").dataset.node);
            item = item.parentElement.closest("li");
        }

        const selected = document.createElement("p");
        const title = document.createElement("strong");
        title.textContent = "Избран възел: ";
        selected.append(title, code(button.dataset.node));

        const route = document.createElement("p");
        route.append("Път: ", code(path.join(" → ")));

        const children = button.parentElement.querySelectorAll(
            ":scope > ul > li > button[data-node]",
        );
        const caption = document.createElement("p");
        caption.textContent = children.length
            ? "Непосредствени наследници:"
            : "Няма непосредствени наследници.";
        const type = button.dataset.node.startsWith("variable:")
            ? "variable"
            : /^int \d+$/.test(button.dataset.node)
                ? "integer"
                : button.dataset.node;
        const description = nodeTypes[type];

        const role = document.createElement("p");
        const roleLabel = document.createElement("strong");
        roleLabel.textContent = "Роля: ";
        role.append(roleLabel, description.role);

        const ruleTitle = document.createElement("p");
        ruleTitle.className = "question";
        ruleTitle.textContent = "Свързани правила на STUDENT";
        const productions = document.createElement("pre");
        productions.append(code(description.rules.map((number) => rules[number]).join("\n\n")));

        const correspondence = document.createElement("p");
        const correspondenceLabel = document.createElement("strong");
        correspondenceLabel.textContent = "Връзка с AST: ";
        correspondence.append(correspondenceLabel, description.ast);
        info.replaceChildren(selected, role, ruleTitle, productions, correspondence, caption);

        if (children.length) {
            const list = document.createElement("ul");
            children.forEach((child) => {
                const entry = document.createElement("li");
                entry.append(code(child.dataset.node));
                list.append(entry);
            });
            info.append(list);
        }
        info.append(route);
    });
})();
