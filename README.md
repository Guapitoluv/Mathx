# Current Supported Implementation:

## Operations:
- Add: "x + y";
- Sub: "x - y";
- Neg: "-x";
- ...: "+x";
- Mul: "x * y";
- Div: "x / y";
- Pow: "x ^ y";

## Symbols:
- Deg: "x°" // convert to radians

// OBS: "f(x) != f(x°)"
-> "f(x) = 'Radians'"
-> "f(x°) = 'Degrees'"
-> "90° ≈ 1.5 rad"

## Variables:
"a = 2" => "b = a" => "b = 2"

// OBS: Variables are evaluated in all its instances:
-> case 1: "expr1: b = a + 2" => "b = NaN"
-> case 2: "expr1: a = 2"
    => "expr2: b = a + 2"
    => "b = 2 + 2"
    => "b = 4"

## Objects:
- Matrix: "[[a, b, c], [d, e, f], [g,h,j]]";
- Polyline: "[(x1, y1),(x2, y2), (x3, y3)]";

## Functions:
- Cos: "cos(x)", "cos x";
- Sin: "sin(x)", "sin x";
- Tan: "tan(x)", "tan x";

## Graphic Functions:
- Plot: "plot((x, y))", "plot (x, y)", "plot([[a], [b]])";

// OBS: plot() return the value in the scope, then:
-> "b = plot(a)" => "b = a"
-> "a = [[1],[1]]"
    => "b = plot(a)*2"
    => "b = a*2"
    => "b = [[1],[1]]*2"
    => "b = [[2],[2]]"

- - -

# What can be plotted in the graph?:
- Matrix (2xn or nx2) // plot all the rows or cols
- Polyline // plot all the point's coordinates
- Tuple (size=2)

- - -

# Matrix:

## Operations:
- Mul: "A * B = [Sum(ain*bnj)]"
-> Scalar: "A * b = [aij*b]"

// OBS: The internal Matrix clasd already have all operations
... including determinant, transpose, inverse etc.

- - -

# Soon:
- More graphic functions;
- Search and fixing of bugs;
- More mathematical functions and operators;
- Site layout update;
- Helper as a page;