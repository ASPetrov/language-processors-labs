"use strict";

// The hierarchy and labels come from the lesson's existing tree markup.
(() => {
    const tree = document.getElementById("ast-tree");
    const info = document.getElementById("nodeInfo");
    if (!tree || !info) return;

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
        info.replaceChildren(selected, route, caption);

        if (children.length) {
            const list = document.createElement("ul");
            children.forEach((child) => {
                const entry = document.createElement("li");
                entry.append(code(child.dataset.node));
                list.append(entry);
            });
            info.append(list);
        }
    });
})();
