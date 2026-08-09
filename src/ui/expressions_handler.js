import { ExpressionEngine } from "../expression_engine.js";
import { environment, graph } from "../data.js";
import { Matrix } from "../math/matrix.js";
import { EvaluationContext } from "../evaluator/evaluation_context.js";


export class ExpressionsHandler {
    constructor() {
        this.exprList = document.getElementById("expr-list");
        this.addExprBtn = document.getElementById("add-expr");
        this.exprEng = new ExpressionEngine(environment);
        this.exprInputs = document.querySelectorAll(".expr-input");
    }
    
    
    updateResult(expr, results) {
        if (results === undefined) {
            this.removeResult(expr);
            return;
        }
        
        if (results instanceof Matrix) {
            results = results.toString();
        }
        
        let result = expr.querySelector(".expr-show");
        
        if (!result) {
            result = document.createElement("span");
            result.classList.add("expr-show");
            expr.append(result);
        }
        
        result.textContent = results;
        
        //graph.draw(environment.getPlots());
    }
    
    removeResult(expr) {
        const f = expr.querySelector(".expr-show")
        if (f) f.remove();
    }
        
    init() {
        this.addExprBtn.addEventListener("click", () => {
            const expr = document.createElement("li");
            const exprInput = document.createElement("textarea");
            const delBtn = document.createElement("button");
            
            expr.dataset.id = crypto.randomUUID();
            exprInput.rows = 1;
            delBtn.textContent = "X";
            
            delBtn.addEventListener("click", () => {
                environment.removePlot(expr.dataset.id);
                expr.remove();
                graph.draw(environment.getPlots());
            })
            
            exprInput.addEventListener("input", () => {
                exprInput.style.height = "0";
                exprInput.style.height =
                    exprInput.scrollHeight + 9 + "px";
            
                this.exprInputs =
                    document.querySelectorAll(".expr-input");
            
                environment.clearPlots();
            
                const expressions = [];
            
                // 1. Compila todas
                for (const input of this.exprInputs) {
                    const expr = input.parentElement;
                    const id = expr.dataset.id;
            
                    try {
                        const ast = this.exprEng.compile(input.value);
            
                        expressions.push({
                            input,
                            expr,
                            id,
                            ast
                        });
                    } catch {
                        this.removeResult(expr);
                    }
                }
            
                // 2. atualiza todas as variáveis
                for (const item of expressions) {
                    if (item.ast.type !== "Definition")
                        continue;
            
                    try {
                        const result =
                            this.exprEng.evaluateAST(
                                item.ast,
                                new EvaluationContext({
                                    plotId: item.id
                                })
                            );
                        this.updateResult(item.expr, result);
                    } catch {
                        this.removeResult(item.expr);
                    }
                }
            
                // 3. avalia todas as expressões
                for (const item of expressions) {
                    try {
                        const result =
                            this.exprEng.evaluateAST(
                                item.ast,
                                new EvaluationContext({
                                    plotId: item.id
                                })
                            );
            
                        this.updateResult(item.expr, result);
                    } catch(err) {
                        console.log("err:"+err);
                        environment.removePlot(item.id);
                        this.removeResult(item.expr);
                    }
                }
                
                graph.draw(environment.getPlots());
            });
            
            expr.classList.add("expr");
            delBtn.classList.add("expr-del-btn");
            exprInput.classList.add("expr-input");
            
            expr.append(exprInput);
            expr.append(delBtn);
            this.exprList.append(expr);
        });
    }
}