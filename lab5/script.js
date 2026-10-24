"use strict";

document.querySelectorAll(".texttask").forEach((task) => {
    task.querySelector(".check-text")?.addEventListener("click", () => {
        const actual = task
            .querySelector("input")
            .value.split(",")
            .map((value) => value.trim())
            .filter(Boolean);
        const expected = task.dataset.expected.split("|");
        const correct = JSON.stringify(actual) === JSON.stringify(expected);
        const feedback = task.querySelector(".feedback");
        feedback.textContent = correct
            ? `Правилно! Всички ${expected.length} лексеми са разпознати.`
            : "Провери броя и реда на лексемите. Не пропускай разделителя ;";
        feedback.className = "feedback " + (correct ? "ok" : "bad");
    });
});

// Prepared token sequence for the scanner demonstration.
const source = document.getElementById("scanner-source");
if (source) {
    const raw = "sum = a + 25;";
    const tokens = [
        ["sum", "IDENTIFIER", 0, 3],
        ["=", "ASSIGNMENT", 4, 5],
        ["a", "IDENTIFIER", 6, 7],
        ["+", "ARITHMETIC", 8, 9],
        ["25", "INTEGER", 10, 12],
        [";", "SEMICOLON", 12, 13],
    ];
    let index = 0;
    const escapeHtml = (value) =>
        value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

    function render() {
        const item = tokens[index];
        source.innerHTML = item
            ? escapeHtml(raw.slice(0, item[2])) +
              '<span class="current">' +
              escapeHtml(raw.slice(item[2], item[3])) +
              "</span>" +
              escapeHtml(raw.slice(item[3]))
            : escapeHtml(raw);
        document.getElementById("scanner-tokens").innerHTML = tokens
            .slice(0, index)
            .map(
                (token) =>
                    '<span class="token">' +
                    escapeHtml(token[1]) +
                    "(" +
                    escapeHtml(token[0]) +
                    ")</span>",
            )
            .join("");
        document.getElementById("scanner-step").textContent =
            index === tokens.length
                ? `Готово: разпознати са всички ${tokens.length} токена.`
                : index === 0
                  ? "Готово за сканиране. Следва: " + item[0]
                  : `Разпознат токен ${index} от ${tokens.length}. Следва: ${item[0]}`;
        document.getElementById("scanner-next").disabled = index === tokens.length;
    }

    document.getElementById("scanner-next").addEventListener("click", () => {
        if (index < tokens.length) index++;
        render();
    });
    document.getElementById("scanner-reset").addEventListener("click", () => {
        index = 0;
        render();
    });
    render();
}
