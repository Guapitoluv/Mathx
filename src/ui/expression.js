import { Matrix } from "../math/matrix.js";

export class Expression {
    constructor(index, onChange, onDestroy) {
        this.index = index;
        this.id = crypto.randomUUID();

        this.onChange = onChange;
        this.onDestroy = onDestroy;

        this.element = this.createDOM();
        this.input = this.element.querySelector(".expr-input");
        this.result = null;

        this.input.addEventListener("input", () => {
            this.resizeInput();
            this.onChange(this);
        });
    }

    createDOM() {
        const expr = document.createElement("li");
        const exprInput = document.createElement("textarea");
        const delBtn = document.createElement("button");
        const container = document.createElement("div");
        const index = document.createElement("span");

        expr.classList.add("expr");
        expr.dataset.id = this.id;

        exprInput.classList.add("expr-input");
        exprInput.rows = 1;
        exprInput.autocapitalize = "none";

        delBtn.classList.add("expr-del-btn");
        delBtn.textContent = "X";

        container.classList.add("expr-container");

        index.classList.add("expr-index");
        index.textContent = this.index;

        delBtn.addEventListener("click", () => {
            this.destroy();
        });

        container.append(index);
        container.append(exprInput);
        container.append(delBtn);

        expr.append(container);

        return expr;
    }

    showResult(value) {
        if (!this.result) {
            this.result = document.createElement("span");
            this.result.classList.add("expr-show");
            this.element.append(this.result);
        }

        this.result.textContent =
            value?.toString() ?? "";
    }

    clearResult() {
        if (this.result) {
            this.result.remove();
            this.result = null;
        }
    }

    resizeInput() {
        const input = this.input;

        input.style.height = "40px";

        const height = input.scrollHeight;

        input.style.height = `${Math.max(40, height)}px`;
    }

    destroy() {
        this.element.remove();
        this.onDestroy(this);
    }
}