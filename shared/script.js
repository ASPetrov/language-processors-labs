"use strict";

function showAssessment(result, state, message) {
    result.textContent = message;
    result.className = "feedback " + state;
}

document.querySelectorAll("button[data-answer-target]").forEach((button) => {
    const answer = document.getElementById(button.dataset.answerTarget);
    const originalLabel = button.textContent.trim();
    const collapsedLabel = originalLabel.includes("решение")
        ? "Покажи примерно решение"
        : "Покажи отговора";
    button.textContent = collapsedLabel;
    button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        answer.style.display = expanded ? "block" : "none";
        button.setAttribute("aria-expanded", String(expanded));
        button.textContent = expanded
            ? (originalLabel.includes("решение") ? "Скрий решението" : "Скрий отговора")
            : collapsedLabel;
    });
});

document.querySelectorAll(".quiz").forEach((quiz) => {
    quiz.querySelector(".check")?.addEventListener("click", () => {
        const selected = quiz.querySelector("input:checked");
        const feedback = quiz.querySelector(".feedback");
        if (!selected) {
            showAssessment(feedback, "notice", "Избери отговор.");
            return;
        }
        const correct = selected.value === quiz.dataset.answer;
        showAssessment(
            feedback,
            correct ? "ok" : "bad",
            correct ? "Правилно!" : "Опитай отново и прегледай обясненията в урока.",
        );
    });
});

// A displayed assessment belongs to the input that was checked, not subsequent edits.
function clearAssessment(event) {
    if (!event.target.matches("input, select, textarea")) return;
    let container = event.target.parentElement;
    while (container && container.tagName !== "MAIN") {
        const result = container.querySelector(".feedback");
        if (result) {
            result.textContent = "";
            result.className = "feedback";
            if (container.id === "builder") {
                container.querySelector("#builder-visual").replaceChildren();
            }
            break;
        }
        container = container.parentElement;
    }
}
document.addEventListener("input", clearAssessment);
document.addEventListener("change", clearAssessment);

// Keep the complete table of contents available without pushing the mobile lesson down.
const navigation = document.querySelector(".layout > nav");
if (navigation) {
    navigation.id ||= "lab-navigation";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.textContent = "Съдържание ▾";
    toggle.setAttribute("aria-controls", navigation.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(expanded));
        navigation.classList.toggle("is-open", expanded);
        toggle.textContent = expanded ? "Скрий съдържанието ▴" : "Съдържание ▾";
    });
    navigation.before(toggle);
}
