"use strict";

// A small declaration trace, independent of the compiler implementation.
const declarations = [
    { name: "score", type: "int", code: "int score = 6;" },
    { name: "ready", type: "boolean", code: "boolean ready = true;" },
    { name: "score", type: "int", code: "int score = 9;" },
    { name: "mark", type: "char", code: "char mark = 'a';" },
];
let position = 0;
const previous = document.getElementById("demo-prev");
const next = document.getElementById("demo-next");
const entries = document.getElementById("demo-entries");
const feedback = document.getElementById("demo-feedback");

function renderTable() {
    const symbols = new Map();
    let duplicate = false;
    for (const declaration of declarations.slice(0, position)) {
        duplicate = symbols.has(declaration.name);
        if (!duplicate) symbols.set(declaration.name, declaration);
    }
    entries.replaceChildren();
    const current = declarations[position - 1];
    for (const symbol of symbols.values()) {
        const row = document.createElement("tr");
        for (const value of [symbol.name, "Променлива", symbol.type, "main"]) {
            const cell = document.createElement("td");
            const text = document.createElement(current === symbol ? "strong" : "span");
            text.textContent = value;
            cell.append(text);
            row.append(cell);
        }
        entries.append(row);
    }
    if (!symbols.size) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.textContent = "Няма записи.";
        row.append(cell);
        entries.append(row);
    }
    document.getElementById("demo-progress").textContent = position
        ? `Стъпка ${position} от ${declarations.length}`
        : "Начало — таблицата е празна.";
    document.getElementById("demo-declaration").textContent = current
        ? current.code
        : "Натисни „Напред“ за първата декларация.";
    feedback.textContent = !position
        ? "Предстоят четири декларации."
        : duplicate
            ? `Семантична грешка: повторна декларация на ${current.name} в main. Не добавяме и не заменяме запис.`
            : `Добавен запис: ${current.name}, тип ${current.type}, блок main.${position === declarations.length ? " Демонстрацията приключи." : ""}`;
    previous.disabled = position === 0;
    next.disabled = position === declarations.length;
}

previous.addEventListener("click", () => {
    if (position > 0) position--;
    renderTable();
});
next.addEventListener("click", () => {
    if (position < declarations.length) position++;
    renderTable();
});
document.getElementById("demo-reset").addEventListener("click", () => {
    position = 0;
    renderTable();
});
