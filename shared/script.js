"use strict";

document.querySelectorAll("button[data-answer-target]").forEach((button) => {
    const answer = document.getElementById(button.dataset.answerTarget);
    button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        answer.style.display = expanded ? "block" : "none";
        button.setAttribute("aria-expanded", String(expanded));
    });
});

document.querySelectorAll(".quiz").forEach((quiz) => {
    quiz.querySelector(".check")?.addEventListener("click", () => {
        const selected = quiz.querySelector("input:checked");
        const feedback = quiz.querySelector(".feedback");
        if (!selected) {
            feedback.textContent = "Избери отговор.";
            feedback.className = "feedback bad";
            return;
        }
        const correct = selected.value === quiz.dataset.answer;
        feedback.textContent = correct
            ? "Правилно!"
            : "Опитай отново и прегледай обясненията в урока.";
        feedback.className = "feedback " + (correct ? "ok" : "bad");
    });
});
