"use strict";

document.querySelectorAll(".quiz").forEach(quiz => {
    quiz.querySelector(".check")?.addEventListener("click", () => {
        const selected = quiz.querySelector("input:checked");
        const feedback = quiz.querySelector(".feedback");
        if (!selected) {
            feedback.textContent = "Избери отговор.";
            feedback.className = "feedback bad";
            return;
        }
        const correct = selected.value === quiz.dataset.answer;
        feedback.textContent = correct ? "Правилно!" : "Опитай отново и прегледай обясненията в урока.";
        feedback.className = "feedback " + (correct ? "ok" : "bad");
    });
});
