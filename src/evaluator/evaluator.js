import { Matrix } from "../math/matrix.js";
import { Polyline } from "../math/polyline.js";

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export class Evaluator {

    constructor(environment) {
        this.environment = environment;
    }

    evaluate(node, context = null) {
        if (context != null) {
            this.context = context;
        }
        
        switch (node.type) {
            case "Number":             return this.evaluateNumber(node);
            case "Variable":           return this.evaluateVariable(node);
            case "FunctionVariable":   return this.evaluateFunctionVariable(node);
            case "Unary":              return this.evaluateUnary(node);
            case "Binary":             return this.evaluateBinary(node);
            case "Function":           return this.evaluateFunction(node);
            case "FunctionDefinition": return this.evaluateFunctionDefinition(node);
            case "Matrix":             return this.evaluateMatrix(node);
            case "Tuple":              return this.evaluateTuple(node);
            case "Index":              return this.evaluateIndex(node);
            case "ListOfPoints":       return this.evaluateListOfPoints(node);
            case "Degrees":            return this.evaluateDegrees(node);
            case "Definition":         return this.evaluateDefinition(node);

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
    
    evaluateFunctionVariable(node) {
        if (this.funcArgs)
            return this.funcArgs[node.name];
    }
    
    unaryPlus(n) {
        return +n;
    }
    
    unaryMinus(n) {
        return -n;
    }
    
    evaluateUnary(node) {
        const a = this.evaluate(node.expression);
        
        switch (node.operator) {
            case "+": return this.unaryPlus(a);
            case "-": return this.unaryMinus(a);
        }
    }
    
    add(left, right) {
        if (left instanceof Matrix)
            return left.add(right);
        
        return left + right;
    }
    
    subtract(left, right) {
        if (left instanceof Matrix)
            return left.subtract(right);
        
        return left - right;
    }
    
    multiply(left, right) {
        if (left instanceof Matrix)
            return left.multiply(right);
        
        if (right instanceof Matrix)
            return right.multiply(left);
        
        return left * right;
    }
    
    divide(left, right) {
        if (left instanceof Matrix || right instanceof Matrix)
            throw new Error("Matrix division not implemented yet");
        
        return left / right;
    }
    
    power(left, right) {
        if (left instanceof Matrix || right instanceof Matrix)
            throw new Error("Matrix power not implemented yet");
        
        return left ** right;
    }
    
    evaluateBinary(node) {
        const a = this.evaluate(node.left);
        const b = this.evaluate(node.right);
    
        switch (node.operator) {
            case "PLUS":     return this.add(a, b);
            case "MINUS":    return this.subtract(a, b);
            case "MULTIPLY": return this.multiply(a, b);
            case "DIVIDE":   return this.divide(a, b);
            case "POWER":    return this.power(a, b);
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
    
    parseTuple(object) {
        if (object instanceof Matrix) {
            if (object.rows === 2) {
                let k = object.clone();
                console.log("k: "+k.toString());
                k.transpose()
                console.log("k: "+k.toString());
                k = k.data;
                console.log("k: "+k.toString());
                
                return k;
            }
            
            if (object.cols === 2)
                return object.data;
            
            throw new Error("Invalida convertion Matrix -> Tuple")
        }
        
        if (Array.isArray(object)) {
            if (object.length === 2) {
                if (object.every(e => Array.isArray(e)))
                    return this.parseTuple(new Matrix(object));
                
                if (object.every(e => isNumber(e)))
                    return [object];
                
                throw new Error("Invalid tuple content");
            }
            
            if (object.every(e => Array.isArray(e) && e.length === 2)) {
                return this.parseTuple(new Matrix(object));
            }
            
            throw new Error("rows and columns of tuple greater than 2")
        }
        
        throw new Error("Invalida convertion Tuple");
    }
    
    conn(args) {
        const points = [];
        
        for (let arg of args) {
            console.log("arg: "+arg)
            for (let p of this.parseTuple(arg)) {
                console.log("p: "+p)
                points.push(p);
            }
        }
        
        return new Polyline(points);
    }
    
    arrayInside(args) {
        return (
            args.length === 1
            && Array.isArray(args[0])
        )
            ?args[0]
            :args;
    }
    
    sum(args) {
        args = this.arrayInside(args);
        
        let s = 0;
        
        for (const arg of args) {
            s += arg;
        }
        
        return s;
    }
    
    max(args) {
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        
        return Math.max(...args);
    }
  
    min(args) {
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        
        return Math.min(...args);
    }
    
    sqrt(arg) {
        return Math.sqrt(arg);
    }
    
    evaluateFunction(node) {
        const args = node.arguments.map(
            arg => this.evaluate(arg)
        );
    
        switch (node.name) {
            case "plot": return this.plot(args[0]);
            case "sqrt": return this.sqrt(args[0]);
            case "conn": return this.conn(args);
            case "max": return this.max(args);
            case "min": return this.min(args);
            case "sum": return this.sum(args);
            case "sin":  return Math.sin(args[0]);
            case "cos":  return Math.cos(args[0]);
            case "tan":  return Math.tan(args[0]);
            case "det":  return this.determinant(args[0]);
            
            default: { //set functions
                for (let funcName of Object.keys(this.environment.functions)) {
                    if (node.name===funcName) {
                        this.funcArgs = {};
                        const func = this.environment.functions[funcName];
                        const params = func.parameters;
                        
                        if (params.length !== args.length)
                            throw new Error("Insuficient args");
                        
                        for (let i=0;i<params.length;i++) {
                            console.log("params["+i+"]: "+params[i]?.length);
                            console.log("args["+i+"]: "+args[i]);
                            this.funcArgs[params[i]] = args[i];
                        }
                        
                        const results = this.evaluate(func.body);
                        this.funcArgs = null;
                        
                        return results
                    }
                }
            }
        }
    }
    
    evaluateFunctionDefinition(node) {
        this.environment.setFunction(
            node.name,
            node.parameters,
            node.body
        );
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