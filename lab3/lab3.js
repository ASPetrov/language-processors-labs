"use strict";
const $ = (id) => document.getElementById(id);
const safe = (s) =>
    String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
function feedback(el, ok, message) {
    el.textContent = message;
    el.className = "feedback " + (ok ? "ok" : "bad");
}
$("set-show")?.addEventListener("click", () => {
    const results = {
        union: "{a, b, 0, 1}",
        concat: "{a0, a1, b0, b1}",
        star: "{ε, a, b, aa, ab, ba, bb}",
    };
    $("set-output").textContent = results[$("set-operation").value];
});
const examples = {
    "a*": "ε, a, aa, aaa, ...",
    ab: "ab",
    "a|b": "a, b",
    "(ab)*": "ε, ab, abab, ...",
    "ab*": "a, ab, abb, ...",
};
function selectedRegex() {
    return $("regex-select")?.value;
}
function regexDemo() {
    const r = selectedRegex();
    $("regex-examples").textContent = "Примери: " + examples[r];
}
$("regex-select")?.addEventListener("change", regexDemo);
if ($("regex-select")) regexDemo();
$("regex-check")?.addEventListener("click", () => {
    const r = selectedRegex(),
        s = $("regex-input").value;
    const patterns = {
        "a*": /^a*$/,
        ab: /^ab$/,
        "a|b": /^(a|b)$/,
        "(ab)*": /^(ab)*$/,
        "ab*": /^ab*$/,
    };
    const ok = patterns[r].test(s);
    feedback(
        $("regex-feedback"),
        ok,
        (s === "" ? "ε" : s) + (ok ? " принадлежи" : " не принадлежи") + " на езика " + r + ".",
    );
});
$("language-check")?.addEventListener("click", () => {
    const s = $("language-input").value,
        ok = /^a*b$/.test(s);
    feedback(
        $("language-feedback"),
        ok,
        `${s || "ε"} ${ok ? "принадлежи" : "не принадлежи"} на a*b: необходими са нула или повече a и точно едно крайно b.`,
    );
});
// Thompson ε-NFA for educational regex grammar: literals a,b; |; implicit concatenation; *, +; parentheses; ε.
function compileRegex(text) {
    let i = 0,
        n = 0,
        edges = [],
        states = [];
    const state = () => {
        states.push(n);
        return n++;
    };
    const edge = (a, ch, b) => edges.push([a, ch, b]);
    const pair = (start, end) => ({ start, end });
    function atom() {
        const ch = text[i];
        if (ch === "(") {
            i++;
            const x = alt();
            if (text[i] !== ")") throw Error("Липсва затваряща скоба.");
            i++;
            return x;
        }
        if (ch === "a" || ch === "b" || ch === "ε") {
            i++;
            const s = state(),
                e = state();
            edge(s, ch === "ε" ? null : ch, e);
            return pair(s, e);
        }
        throw Error("Очаква се a, b, ε или (.");
    }
    function repeat() {
        let x = atom();
        while (text[i] === "*" || text[i] === "+") {
            const op = text[i++],
                s = state(),
                e = state();
            edge(s, null, x.start);
            edge(x.end, null, x.start);
            edge(x.end, null, e);
            if (op === "*") edge(s, null, e);
            x = pair(s, e);
        }
        return x;
    }
    function concat() {
        let x = null;
        while (i < text.length && text[i] !== ")" && text[i] !== "|") {
            const y = repeat();
            if (x) {
                edge(x.end, null, y.start);
                x = pair(x.start, y.end);
            } else x = y;
        }
        if (!x) throw Error("Празен операнд. Използвай ε за празния низ.");
        return x;
    }
    function alt() {
        let x = concat();
        while (text[i] === "|") {
            i++;
            const y = concat(),
                s = state(),
                e = state();
            edge(s, null, x.start);
            edge(s, null, y.start);
            edge(x.end, null, e);
            edge(y.end, null, e);
            x = pair(s, e);
        }
        return x;
    }
    const x = alt();
    if (i !== text.length) throw Error("Невалиден израз при позиция " + (i + 1));
    return { ...x, edges, states };
}
function closure(nfa, ss) {
    const out = new Set(ss),
        stack = [...ss];
    while (stack.length) {
        const q = stack.pop();
        for (const [a, ch, b] of nfa.edges)
            if (a === q && ch === null && !out.has(b)) {
                out.add(b);
                stack.push(b);
            }
    }
    return out;
}
function stepNfa(nfa, ss, ch) {
    const next = new Set();
    for (const q of ss) for (const [a, c, b] of nfa.edges) if (a === q && c === ch) next.add(b);
    return closure(nfa, next);
}
function equalRegex(a, b) {
    const A = compileRegex(a),
        B = compileRegex(b),
        startA = closure(A, [A.start]),
        startB = closure(B, [B.start]);
    const key = (x, y) =>
        [...x].sort((a, b) => a - b).join(",") + ";" + [...y].sort((a, b) => a - b).join(",");
    const todo = [[startA, startB]],
        seen = new Set();
    while (todo.length) {
        const [x, y] = todo.shift(),
            k = key(x, y);
        if (seen.has(k)) continue;
        seen.add(k);
        if (x.has(A.end) !== y.has(B.end)) return false;
        for (const c of ["a", "b"]) todo.push([stepNfa(A, x, c), stepNfa(B, y, c)]);
    }
    return true;
}
document.querySelectorAll(".lab-task").forEach((el) =>
    el.querySelector(".lab-check")?.addEventListener("click", () => {
        let ok = false,
            message = "";
        const kind = el.dataset.kind;
        if (kind === "set") {
            const actual = el
                    .querySelector("input")
                    .value.split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                expected = el.dataset.values.split("|");
            ok =
                actual.length === expected.length &&
                new Set(actual).size === expected.length &&
                actual.every((x) => expected.includes(x));
            message = ok ? "Правилно: AB = {ac, bc}." : "В AB първо стои символ от A, после c.";
        } else if (kind === "multi") {
            const actual = [...el.querySelectorAll("input:checked")].map((x) => x.value),
                expected = el.dataset.values.split("|");
            ok = actual.length === expected.length && actual.every((x) => expected.includes(x));
            message = ok
                ? "Всички низове са определени правилно."
                : "Провери групирането и броя повторения.";
        } else if (kind === "regex") {
            const value = el.querySelector("input").value.replace(/\s/g, "");
            try {
                ok = equalRegex(value, el.dataset.target);
                message = ok
                    ? "Правилно: двата израза описват един и същ език."
                    : "Изразът е валиден, но описва различен език.";
            } catch (e) {
                message = "Невалиден израз: " + e.message;
            }
        }
        feedback(el.querySelector(".feedback"), ok, message);
    }),
);
// Small deterministic automata: undefined transitions are rejecting sink transitions.
const machines = {
    ab: {
        states: ["q0", "q1", "q2"],
        initial: "q0",
        final: ["q2"],
        trans: { q0: { a: "q1" }, q1: { b: "q2" } },
        edges: [
            ["q0", "q1", "a"],
            ["q1", "q2", "b"],
        ],
    },
    astar: {
        states: ["q0"],
        initial: "q0",
        final: ["q0"],
        trans: { q0: { a: "q0" } },
        edges: [["q0", "q0", "a"]],
    },
    astarbc: {
        states: ["q0", "q1", "q2"],
        initial: "q0",
        final: ["q2"],
        trans: { q0: { a: "q0", b: "q1" }, q1: { c: "q2" } },
        edges: [
            ["q0", "q0", "a"],
            ["q0", "q1", "b"],
            ["q1", "q2", "c"],
        ],
    },
};
function drawMachine(machine, current, activeEdge) {
    const pos = { q0: [95, 115], q1: [295, 115], q2: [495, 115] },
        used = machine.states;
    let s =
        '<svg viewBox="0 0 650 235" role="img" aria-label="Диаграма на краен автомат"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0 0 L9 3 L0 6" stroke="#333" fill="none"/></marker></defs><path d="M12 115 H60" marker-end="url(#arrow)"/>';
    for (const [from, to, ch] of machine.edges) {
        const [x, y] = pos[from],
            [tx, ty] = pos[to],
            active =
                activeEdge &&
                activeEdge[0] === from &&
                activeEdge[1] === to &&
                activeEdge[2] === ch;
        if (from === to) {
            s += `<path class="${active ? "active" : ""}" d="M${x - 18} ${y - 24} C${x - 85} ${y - 95},${x + 85} ${y - 95},${x + 18} ${y - 24}" marker-end="url(#arrow)"/><text x="${x}" y="35">${ch}</text>`;
        } else {
            s += `<path class="${active ? "active" : ""}" d="M${x + 35} ${y} H${tx - 35}" marker-end="url(#arrow)"/><text x="${(x + tx) / 2}" y="100">${ch}</text>`;
        }
    }
    for (const q of used) {
        const [x, y] = pos[q];
        s += `<circle class="${q === current ? "active" : ""}" cx="${x}" cy="${y}" r="34"/>`;
        if (machine.final.includes(q)) s += `<circle cx="${x}" cy="${y}" r="27" fill="none"/>`;
        s += `<text x="${x}" y="121">${q}</text>`;
    }
    return s + "</svg>";
}
if ($("automaton-diagram")) {
    let m = machines.astarbc,
        input = "aaabc",
        cursor = 0,
        q = "q0",
        failed = false,
        trace = [];
    function render() {
        const active = trace.length ? trace.at(-1).edge : null;
        $("automaton-diagram").innerHTML = drawMachine(m, failed ? null : q, active);
        $("automaton-trace").innerHTML = trace
            .map((t) => `<span class="token">${safe(t.ch)} → ${safe(t.to || "няма преход")}</span>`)
            .join("");
        const done = failed || cursor >= input.length,
            accept = !failed && done && m.final.includes(q);
        $("automaton-status").textContent = failed
            ? `Отхвърлен: липсва преход за „${trace.at(-1).ch}“.`
            : done
              ? `${accept ? "Приет" : "Отхвърлен"}: обработен е целият низ; текущо състояние ${q}.`
              : `Позиция ${cursor + 1} от ${input.length}. Текущо състояние ${q}. Следващ символ: ${input[cursor]}.`;
        $("automaton-next").disabled = done;
    }
    function reset() {
        m = machines[$("automaton-select").value];
        input = $("automaton-input").value;
        cursor = 0;
        q = m.initial;
        failed = false;
        trace = [];
        render();
    }
    $("automaton-start").addEventListener("click", reset);
    $("automaton-reset").addEventListener("click", reset);
    $("automaton-select").addEventListener("change", () => {
        const type = $("automaton-select").value;
        $("automaton-input").value = { ab: "ab", astar: "aaa", astarbc: "aaabc" }[type];
        reset();
    });
    $("automaton-next").addEventListener("click", () => {
        if (failed || cursor >= input.length) return;
        const ch = input[cursor++],
            from = q,
            to = m.trans[q]?.[ch];
        trace.push({ ch, to, edge: to ? [from, to, ch] : null });
        if (!to) failed = true;
        else q = to;
        render();
    });
    reset();
}
if ($("builder")) {
    $("builder-check").addEventListener("click", () => {
        const a = document.querySelector('[data-transition="0a"]').value,
            b = document.querySelector('[data-transition="0b"]').value,
            f = $("builder-final").value;
        const ok = a === "q0" && b === "q1" && f === "q1";
        feedback(
            $("builder-feedback"),
            ok,
            ok
                ? "Правилно! q0 има цикъл при a, преход към q1 при b, а q1 е приемащо."
                : "Провери: a може да се повтаря, b е задължително и след b входът приключва.",
        );
        const custom = {
            states: ["q0", "q1"],
            initial: "q0",
            final: f === "both" ? ["q0", "q1"] : [f],
            edges: [],
        };
        if (a !== "none") custom.edges.push(["q0", a, "a"]);
        if (b !== "none") custom.edges.push(["q0", b, "b"]);
        $("builder-visual").innerHTML = drawMachine(custom, null, null);
    });
}
