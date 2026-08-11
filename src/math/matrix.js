function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export class Matrix {
    constructor(data, rule=null) {
        this.data = data;
        this.rule = rule;
    }
    
    get rows() {
        return this.data.length;
    }
    
    get cols() {
        return this.data[0].length;
    }
    
    get shape() {
        return [this.rows, this.cols];
    }
    
    get isSquare() {
        return this.rows === this.cols;
    }
    
    get size() {
        return this.rows * this.cols;
    }
    
    get isRowVector() {
        return this.rows === 1;
    }
    
    get isColumnVector() {
        return this.cols === 1;
    }
    
    get isVector() {
        return this.isRowVector || this.isColumnVector;
    }
    
    toString() {
        return this.data
            .map(row => `[${row.join(", ")}]`)
            .join("\n");
    }
    
    row(i) {
        return [...this.data[i]];
    }
    
    column(j) {
        return this.data.map(row => row[j]);
    }
    
    static fromRule(rows, cols, rule) {
        const matrix = new Matrix(
            Array.from({ length: rows }, () => Array(cols))
        );
        
        return matrix.create(rule);
    }
    
    get(i, j) {
        return this.data[i][j];
    }
    
    set(i, j, value) {
        this.data[i][j] = value;
    }
    
    map(fn) {
        return this.create((i, j) => fn(this.get(i, j), i, j))
    }
    
    forEach(callback) {
        for (let i=0;i<this.rows;i++) {
            for (let j=0;j<this.cols;j++) {
                callback(this.get(i, j), i, j);
            }
        }
    }
    
    create(fn) {
        const matrix = [];
        
        for (let i=0;i<this.rows;i++) {
            matrix.push([]);
            
            for (let j=0;j<this.cols;j++) {
                matrix[i].push(fn(i, j));
            }
        }
        
        return new Matrix(matrix);
    }
    
    clone() {
        return this.create((i, j) => this.get(i, j));
    }
    
    equals(other) {
        if (this.rows !== other.rows || this.cols !== other.cols)
            return false;
        
        for (let i=0;i<this.rows;i++) {
            for (let j=0;j<this.cols;j++) {
                if (this.get(i, j) !== other.get(i, j))
                    return false;
            }
        }
        return true;
    }
    
    
    add(other) {
        return this.create((i, j) => this.get(i, j) + other.get(i, j));
    }
    
    subtract(other) {
        return this.create((i, j) => this.get(i, j) - other.get(i, j));
    }
    
    multiply(other) {
        if (!(other instanceof Matrix))
            return this.map(e => e*other);
        
        if (this.cols !== other.rows) {
            throw new Error("M * M, lin !== col");
        }
        
        const matrix = [];
        
        for (let i=0;i<this.rows;i++) {
            matrix.push([]);
            
            for (let j=0;j<other.cols;j++) {
                let s = 0;
            
                for (let n=0;n<this.cols;n++) {
                    s += this.get(i, n) * other.get(n, j);
                }
                
                matrix[i].push(s);
            }
        }
        
        return new Matrix(matrix);
    }
    
    static zeros(rows, cols) {
        const matrix = [];
        
        for (let i=0;i<rows;i++) {
            matrix.push([]);
            
            for (let j=0;j<cols;j++) {
                matrix[i].push(0);
            }
        }
        
        return new Matrix(matrix);
    }
    
    static ones(rows, cols) {
        const matrix = [];
        
        for (let i=0;i<rows;i++) {
            matrix.push([]);
            
            for (let j=0;j<cols;j++) {
                matrix[i].push(1);
            }
        }
        
        return new Matrix(matrix);
    }
    
    static random(rows, cols, min=null, max=null) {
        if (min !== null && max === null) {
            max = min;
            min = 0;
        }
        
        const matrix = [];
        
        for (let i=0;i<rows;i++) {
            matrix.push([]);
            
            for (let j=0;j<cols;j++) {
                matrix[i].push(
                    (max !== null)
                        ?getRandomInt(min, max)
                        :Math.random()
                );
            }
        }
        
        return new Matrix(matrix);
    }

    minor(i, j) {
        const matrix = this.data
            .filter((_, row) => row !== i)
            .map(row =>
                row.filter((_, col) => col !== j)
            );

        return new Matrix(matrix).determinant();
    }
    
    
    cofactor(i, j) {
        return (-1) ** (i + j) * this.minor(i, j);
    }
    
    
    determinant() {
        if (!this.isSquare)
            throw new Error("Determinant requires a square matrix");

        if (this.rows === 1)
            return this.get(0, 0);

        if (this.rows === 2) {
            return (
                this.get(0, 0) * this.get(1, 1) -
                this.get(0, 1) * this.get(1, 0)
            );
        }

        let det = 0;

        for (let j=0;j<this.cols;j++) {
            det += this.get(0, j) * this.cofactor(0, j);
        }
      
        return det;
    }
    
    transpose() {
        const matrix = [];
        
        for (let i=0;i<this.cols;i++)
            matrix.push(this.column(i));
        
        this.data = matrix;
    }
}