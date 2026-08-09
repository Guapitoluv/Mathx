import { Matrix } from "../math/matrix.js";
import { Polyline } from "../math/polyline.js";

export class Evaluator {

    constructor(environment) {
        this.environment = environment;
    }

    evaluate(node, context = null) {
        if (context != null) {
            this.context = context;
        }
        
        switch (node.type) {
            case "Number":       return this.evaluateNumber(node);
            case "Variable":     return this.evaluateVariable(node);
            case "Unary":        return this.evaluateUnary(node);
            case "Binary":       return this.evaluateBinary(node);
            case "Function":     return this.evaluateFunction(node);
            case "Matrix":       return this.evaluateMatrix(node);
            case "Tuple":        return this.evaluateTuple(node);
            case "Index":        return this.evaluateIndex(node);
            case "ListOfPoints": return this.evaluateListOfPoints(node);
            case "Degrees":      return this.evaluateDegrees(node);
            case "Definition":   return this.evaluateDefinition(node);

            default:
                throw new Error(
                    `Unknown AST node: ${node.type}`
                );
        }
    }
    
    evaluateNumber(node) {
        return node.value;
    }
    
    evaluateVariable(node) {
        const value = this.environment.get(node.name);
    
        if (value === undefined) {
            throw new Error(`Undefined variable: ${node.name}`);
        }
    
        return value;
    }
    
    unaryPlus(value) {
        if (value instanceof Matrix) {
            return value.map(e => +e);
        }
        
        return +value;
    }
    
    unaryMinus(value) {
        if (value instanceof Matrix) {
            return value.map(e => -e);
        }
        
        return -value;
    }
    
    evaluateUnary(node) {
        const a = this.evaluate(node.expression);
        
        switch (node.operator) {
            case "+": return this.unaryPlus(a);
            case "-": return this.unaryMinus(a);
        }
    }
    
    multiply(left, right) {
        if (left instanceof Matrix)
            return left.multiply(right);
        
        if (right instanceof Matrix)
            return right.multiply(left);
        
        return left * right;
    }
    
    evaluateBinary(node) {
        const a = this.evaluate(node.left);
        const b = this.evaluate(node.right);
    
        switch (node.operator) {
            case "PLUS":     return a + b;
            case "MINUS":    return a - b;
            case "MULTIPLY": return this.multiply(a, b);
            case "DIVIDE":   return a / b;
            case "POWER":    return a ** b;
        }
    }
    
    evaluateIndex(node) {
        const object = this.evaluate(node.object);
        
        const indices = node.indices.map(
            index => this.evaluate(index)
        );
        
        if (!(object instanceof Matrix))
            throw new Error("Indexing requires a matrix");
        
        if (indices.length !== 2)
            throw new Error("Matrix indexing requires two indices");
        
        return object.get(indices[0], indices[1]);
    }
    
    evaluateDegrees(node) {
        return this.evaluate(
            node.value
        ) * (Math.PI / 180);
    }
    
    evaluateFunction(node) {
        const args = node.arguments.map(
            arg => this.evaluate(arg)
        );
    
        switch (node.name) {
            case "plot": return this.plot(args[0]);
            case "sin":  return Math.sin(args[0]);
            case "cos":  return Math.cos(args[0]);
            case "tan":  return Math.tan(args[0]);
            case "det":  return this.determinant(args[0]);
        }
    }
    
    evaluateTuple(node) {
        return node.elements.map(
            element => this.evaluate(element)
        );
    }
    
    evaluateMatrix(node) {
        return new Matrix(
            node.rows.map(row =>
                row.map(element =>
                    this.evaluate(element)
                )
            )
        );
    }
    
    evaluateListOfPoints(node) {
        return new Polyline(
            node.points.map(point =>
                point.elements.map(element =>
                    this.evaluate(element)
                )
            )
        );
    }
    
    evaluateDefinition(node) {
        const value = this.evaluate(node.value);
        
        this.environment.set(node.variable, value);
        
        return value;
    }
    
    plot(value) {
        this.environment.toPlot(
            this.context.plotId,
            value
        );
        return value;
    }
}