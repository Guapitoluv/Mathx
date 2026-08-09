import { Tokenizer } from "./parser/tokenizer.js";
import { Parser } from "./parser/parser.js";
import { Evaluator } from "./evaluator/evaluator.js";


export class ExpressionEngine {
    constructor(environment) {
        this.tokenizer = new Tokenizer();
        this.parser = new Parser();
        this.evaluator = new Evaluator(environment);
    }

    compile(source) {
        const tokens = this.tokenizer.tokenize(source);
        return this.parser.parse(tokens);
    }
    
    evaluateAST(ast, context) {
        return this.evaluator.evaluate(ast, context);
    }

    evaluate(source, context) {
        const ast = this.compile(source);
        return this.evaluateAST(ast, context);
    }

}