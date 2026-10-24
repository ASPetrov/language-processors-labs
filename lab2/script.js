"use strict";

document.querySelectorAll("button[data-answer-target]").forEach(button => {
    const answer = document.getElementById(button.dataset.answerTarget);
    button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        answer.style.display = expanded ? "block" : "none";
        button.setAttribute("aria-expanded", String(expanded));
    });
});
