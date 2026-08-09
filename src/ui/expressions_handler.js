import { environment, graph } from "../data.js";
import { Expression } from "./expression.js";
import { EvaluationContext } from "../evaluator/evaluation_context.js";

export class ExpressionsHandler {
    constructor(expressionEngine) {
        console.log("ExpressionsHandler criado");
        this.expressionEngine = expressionEngine;
        this.expressions = [];

        this.exprList = document.getElementById("expr-list");
        this.addExprBtn = document.getElementById("add-expr");

        this.init();
    }

    init() {
        this.addExprBtn.addEventListener(
            "click",
            () => this.addExpression()
        );
    }

    addExpression() {
        console.log("addExpression chamado")
        
        
        const expression = new Expression(
            this.expressions.length + 1,
            () => this.evaluateAll(),
            expression => this.removeExpression(expression)
        );
    
        this.expressions.push(expression);
        this.exprList.append(expression.element);
    }
    
    evaluateAll() {
        environment.clearPlots();
    
        const compiled = [];
    
        // 1. Compilar tudo
        for (const expression of this.expressions) {
            try {
                const ast = this.expressionEngine.compile(
                    expression.input.value
                );
    
                expression.ast = ast;
    
                compiled.push(expression);
            } catch {
                expression.clearResult();
            }
        }
    
        // 2. Definições primeiro
        for (const expression of compiled) {
            if (expression.ast.type !== "Definition")
                continue;
    
            try {
                const context = new EvaluationContext({
                    plotId: expression.id
                });
    
                const result =
                    this.expressionEngine.evaluateAST(
                        expression.ast,
                        context
                    );
    
                expression.showResult(result);
            } catch {
                expression.clearResult();
            }
        }
    
        // 3. Depois todas as expressões
        for (const expression of compiled) {
            if (expression.ast.type === "Definition")
                continue;
            
            try {
                const context = new EvaluationContext({
                    plotId: expression.id
                });
    
                const result =
                    this.expressionEngine.evaluateAST(
                        expression.ast,
                        context
                    );
    
                expression.showResult(result);
            } catch (error) {
                console.error(error);
    
                expression.clearResult();
                environment.removePlot(expression.id);
            }
        }
        graph.draw(environment.getPlots());
    }
    
    removeExpression(expression) {
        const index = this.expressions.indexOf(expression);
    
        if (index !== -1)
            this.expressions.splice(index, 1);
    
        this.updateIndexes();
        this.evaluateAll();
    }
    
    updateIndexes() {
        this.expressions.forEach((expression, index) => {
            expression.index = index + 1;
    
            const indexElement =
                expression.element.querySelector(".expr-index");
    
            indexElement.textContent = expression.index;
        });
    }
}