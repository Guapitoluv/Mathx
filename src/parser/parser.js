export class Parser {
    
    // =========================================================
    // 1. Entrada pública
    // =========================================================
    
    parse(tokens) {
        this.isInsideFunc = false;
        this.tokens = tokens;
        this.end = tokens.length;
        this.i = 0;
        
        const node = this.parseDefinition();
        
        if (this.current()) {
            throw new Error(
                `Unexpected token: ${this.current().type}`
            );
        }
        
        return node;
    }
    
    // =========================================================
    // 2. Navegação pelos tokens
    // =========================================================
    
    current() {
        return this.tokens[this.i];
    }
    
    peek(offset = 1) {
        return this.tokens[this.i + offset];
    }
    
    advance() {
        return this.tokens[this.i++];
    }
    
    currentType(type) {
        return this.current()?.type === type
    }
    
    expect(type) {
        if (this.current()?.type !== type)
            throw new Error(`Expected ${type}`);
    
        return this.advance();
    }
    
    // =========================================================
    // 3. Expressões / precedência
    // =========================================================
    
    precedence(type) {
        switch (type) {
            case "PLUS":
            case "MINUS":
                return 10;

            case "MULTIPLY":
            case "DIVIDE":
                return 20;

            case "POWER":
                return 30;

            default:
                return 0;
        }
    }
    
    expression(minPrec) {
        let left = this.prefix();
    
        while (true) {
            
            if (this.canStartPostfix()) {
                left = this.postfix(left);
                continue;
            }
            
            const token = this.current();
            
            if (!token) break;
            
            const prec = this.precedence(token.type);
            
            if (prec <= minPrec) break;
    
            this.advance();
    
            const right = this.expression(
                token.type === "POWER"
                    ? prec - 1
                    : prec
            );
    
            left = this.infix(left, token, right);
        }
    
        return left;
    }
    
    // =========================================================
    // 4. Prefix
    // =========================================================
    
    prefix() {
        const token = this.advance();

        switch (token.type) {
            case "NUMBER":       return this.prefixNumber(token);
            case "IDENTIFIER":   return this.prefixIdentifier(token);
            case "LEFT_BRACKET": return this.prefixBracket();
            case "LEFT_PAREN":   return this.prefixParenthesized();
            
            case "MINUS":
            case "PLUS":
                return this.prefixUnary(token);
            
            default: throw new Error("Unexpected token: " + token.type);
        }

    }
    
    prefixNumber(token) {
        return {
            type: "Number",
            value: token.value
        };
    }
    
    prefixIdentifier(token) {
        if (this.currentType("LEFT_PAREN")) {
            console.log("prefixIdentifier");
            
            let i=1;
            
            while (true) {
                if (this.i+i+1 >= this.end) break;
                
                if (this.peek(i)?.type === "RIGHT_PAREN") {
                    if (this.peek(i+1)?.type === "EQUAL") {
                        return this.parseFunctionDefinition(token.value);
                    }
                }
                
                i++;
            }
            return this.parseFunctionCall(token.value);
        }
        
        if (
            this.isPrefixFunction(token.value)
            && this.canStartExpression(this.current()?.type)
        ) {
            return {
                type: "Function",
                name: token.value,
                arguments: [this.expression(0)]
            };
        }
        
        if (this.isInsideFunc)
            return {
                type: "FunctionVariable",
                name: token.value
            }
        
        return {
            type: "Variable",
            name: token.value
        };
    }
    
    prefixParenthesized() {
        const first = this.expression(0);
    
        if (this.currentType("COMMA"))
            return this.parseTuple(first);
    
        this.expect("RIGHT_PAREN");
    
        return first;
    }
    
    prefixBracket() {
        if (this.currentType("LEFT_BRACKET"))
            return this.parseMatrix();
                
        if (this.currentType("LEFT_PAREN"))
            return this.parseListOfPoints();
                
        return this.expression(0);
        
    }
    
    prefixUnary(token) {
        return {
            type: "Unary",
            operator: token.type === "MINUS" ? "-" : "+",
            expression: this.expression(100)
        };
    }
    
    // =========================================================
    // 5. Infix
    // =========================================================
    
    infix(left, token, right) {
        return {
            type: "Binary",
            operator: token.type,
            left,
            right
        };
    }
    
    // =========================================================
    // 5. Postfix
    // =========================================================
    
    canStartPostfix() {
        return [
            "LEFT_BRACKET",
            "FACTORIAL",
            "DEGREE"
        ].includes(this.current()?.type);
    }
    
    postfix(left) {
        const token = this.current();
    
        switch (token.type) {
            case "LEFT_BRACKET":
                return this.postfixIndex(left);
            
            case "DEGREE":
                return this.postfixDegree(left);
            
            default:
                throw new Error(
                    `Unexpected postfix: ${token.type}`
                );
        }
    }
    
    postfixIndex(object) {
        this.expect("LEFT_BRACKET");
    
        const indices = [];
    
        indices.push(this.expression(0));
    
        while (this.currentType("COMMA")) {
            this.advance();
            indices.push(this.expression(0));
        }
    
        this.expect("RIGHT_BRACKET");
    
        return {
            type: "Index",
            object,
            indices
        };
    }
    
    postfixDegree(value) {
        this.expect("DEGREE");
        
        return {
            type: "Degrees",
            value
        };
    }
    
    // =========================================================
    // 6. Outfix / delimitadores
    // =========================================================
    
    outfix(openToken) {
        switch (openToken.type) {
            case "LEFT_PAREN":
                return this.outfixParentheses();
    
            case "LEFT_BRACKET":
                return this.outfixBracket();
    
            default:
                throw new Error("outfix error");
        }
    }
    
    outfixParentheses() {
        const first = this.expression(0);
    
        if (this.currentType("COMMA"))
            return this.parseTuple(first);
    
        this.expect("RIGHT_PAREN");
    
        return first;
    }
    
    // =========================================================
    // 7. Construções específicas
    // =========================================================
    
    parseDefinition() {
        if (
            this.currentType("IDENTIFIER") &&
            this.peek()?.type === "EQUAL"
        ) {
    
            const name = this.advance().value;
    
            this.advance(); // consome '='
    
            return {
                type: "Definition",
                variable: name,
                value: this.expression(0)
            };
        }
    
        return this.expression(0);
    }
    
    parseFunctionDefinition(name) {
        this.expect("LEFT_PAREN");
        
        const parameters = [];
        
        if (!this.currentType("RIGHT_PAREN")) {
            parameters.push(this.expect("IDENTIFIER").value);
            
            while (this.currentType("COMMA")) {
                this.advance();
                parameters.push(this.expect("IDENTIFIER").value);
            }
        }
        
        this.expect("RIGHT_PAREN");
        this.expect("EQUAL");
        
        this.isInsideFunc = true;
        const body = this.expression(0);
        this.isInsideFunc = false;
        
        return {
            type: "FunctionDefinition",
            name,
            parameters,
            body
        }
    }
    
    parseFunctionCall(name) {
        this.expect("LEFT_PAREN");
    
        const args = [];
    
        if (!this.currentType("RIGHT_PAREN")) {
            args.push(this.expression(0));
    
            while (this.currentType("COMMA")) {
                this.advance();
                args.push(this.expression(0));
            }
        }
    
        this.expect("RIGHT_PAREN");
    
        return {
            type: "Function",
            name,
            arguments: args
        };
    }
    
    parseTuple(first) {
        const elements = [first];
    
        while (this.currentType("COMMA")) {
            this.advance();
            elements.push(this.expression(0));
        }
        
        this.expect("RIGHT_PAREN");
        
        return {
            type: "Tuple",
            elements
        };
    }
    
    parseMatrix() {
        const rows = [];
        
        while (true) {
            this.expect("LEFT_BRACKET");
            
            const row = [];
            
            row.push(this.expression(0));
            
            while (this.currentType("COMMA")) {
                this.advance();
                row.push(this.expression(0));
            }
            
            this.expect("RIGHT_BRACKET");
            
            rows.push(row);
            
            if (!this.currentType("COMMA"))
                break;
            
            this.advance();
        }
        
        this.expect("RIGHT_BRACKET");
        
        return {
            type: "Matrix",
            rows
        };
    }
    
    parseListOfPoints() {
        const points = [];
        
        while (true) {
            this.expect("LEFT_PAREN");
            
            const point = this.parseTuple(this.expression(0));
            
            points.push(point);
            
            if (!this.currentType("COMMA"))
                break;
            
            this.advance();
        }
        
        this.expect("RIGHT_BRACKET");
        
        return {
            type: "ListOfPoints",
            points
        };
    }
    
    // =========================================================
    // 8. Predicados / tabelas auxiliares
    // =========================================================
    
    isPrefixFunction(name) {
        return [
            "sin",
            "cos",
            "tan",
            "det",
            "sqrt",
            "abs",
            "trace",
            "rank"
        ].includes(name);
    }
    
    canStartExpression(type) {
        return [
            "NUMBER",
            "LEFT_PAREN",
            "LEFT_BRACKET",
            "IDENTIFIER",
            "MINUS",
            "PLUS"
        ].includes(type)
    }
}