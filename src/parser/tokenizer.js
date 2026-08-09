export class Tokenizer {

    get notFinishedYet() {
        return this.index < this.source.length
    }

    tokenize(source) {
        this.source = source;
        this.index = 0;
        this.tokens = [];
        
        while (this.index < this.source.length) {
            this.scanToken();
        }

        return this.tokens;
    }
    
    addToken(type) {
        this.tokens.push({ type });
    }
    
    isSpace(c) {
        return /\s/.test(c);
    }
    
    isNum(c) {
        return /[0-9]/.test(c);
    }
    
    isAlpha(c) {
        return /[a-zA-Z_]/.test(c);
    }

    scanToken() {
        const c = this.source[this.index];
        
        if (this.isSpace(c)) {
            this.index++;
            return;
        }
        
        if (this.isNum(c)) {
            this.readNumber();
            return;
        }
        
        if (this.isAlpha(c)) {
            this.readIdentifier();
            return;
        }
        
        const operators = new Map([
            ["+", "PLUS"],
            ["-", "MINUS"],
            ["*", "MULTIPLY"],
            ["/", "DIVIDE"],
            ["^", "POWER"],
            ["(", "LEFT_PAREN"],
            ["[", "LEFT_BRACKET"],
            ["{", "LEFT_BRACE"],
            [")", "RIGHT_PAREN"],
            ["]", "RIGHT_BRACKET"],
            ["}", "RIGHT_BRACE"],
            ["=", "EQUAL"],
            [",", "COMMA"],
            ["°", "DEGREE"]
        ]);
        
        const type = operators.get(c);
        if (type) this.addToken(type);

        this.index++;
    }

    readNumber() {
        let value = "";

        while (
            this.index < this.source.length &&
            /[0-9.]/.test(this.source[this.index])
        ) {
            value += this.source[this.index];
            this.index++;
        }

        this.tokens.push({
            type: "NUMBER",
            value: Number(value)
        });
    }

    readIdentifier() {
        let value = "";

        while (
            this.notFinishedYet &&
            /[a-zA-Z0-9_]/.test(this.source[this.index])
        ) {
            value += this.source[this.index];
            this.index++;
        }

        this.tokens.push({
            type: "IDENTIFIER",
            value
        });
    }
}