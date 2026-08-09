const matrix = new Matrix([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]);

console.log("rows === 3:", matrix.rows === 3);
console.log("cols === 3:", matrix.cols === 3);
console.log("isSquared:", matrix.isSquare);
console.log("shape === [3, 3]", matrix.shape[0] === 3 && matrix.shape[1] === 3);
console.log("size === 9:", matrix.size === 9);
console.log("not isRowVector:", !matrix.isRowVector);
console.log("not isColumnVector:", !matrix.isColumnVector);
console.log("not isVector:", !matrix.isVector);

const row = matrix.row(0);
console.log("row(0) === [1, 2, 3]:", row[0] === 1 && row[1] === 2 && row[2] === 3);

const column = matrix.column(0);
console.log("column(0) === [1, 4, 7]:", column[0] === 1 && column[1] === 4 && column[2] === 7);

const ruledMatrix = Matrix.fromRule(3, 3, (i, j) => i+j);

console.log(ruledMatrix.toString());

console.log("get(0,0) === 1", matrix.get(0, 0) === 1);
matrix.set(0, 0, 0);
console.log("set(0,0) === 0", matrix.get(0, 0) === 0);

const mapMatrix = matrix.map(e => e+1);
console.log(mapMatrix.toString());