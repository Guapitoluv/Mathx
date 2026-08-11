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

## Variables: "a = 2" => "b = a" => "b = 2"

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

## What can be plotted in the graph?:
- Matrix (2xn or nx2) // plot all the rows or cols
- Polyline // plot all the point's coordinates
- Tuple (size=2)

- - -

## Matrix:

### Operations:
- Mul: "A * B = [Sum(ain*bnj)]"
-> Scalar: "A * b = [aij*b]"

// OBS: The internal Matrix clasd already have all operations
... including determinant, transpose, inverse etc.

- - -

# Pipeline:

Symbol -> Token -> AST -> Object/Result

## Tokenization:

Symbol -> Token

### Tokens:
- "IDENTIFIER"
- "NUMBER"
- "COMMA"
- "LEFT_PAREN"
- "RIGHT_PAREN"
- "PLUS"
- "MINUS"
- "DIVIDE"
- "MULTIPLY"
- "POWER"
- "LEFT_BRACKET"
- "RIGHT_BRACKET"
- "LEFT_BRACE" // not used yet
- "RIGHT_BRACE" // not used yet

## Parsing:

Token -> AST

### ASTs:
- "Number"
- "Variable"
- "Function"
- "FunctionDefinition"
- "Unary"
- "Binary"
- "FunctionVariable"
- "Matrix"
- "Tuple"
- "Index"
- "ListOfPoints"
- "Degrees"
- "Definition"

## Evaluation:

AST -> Object

### Objects:
- Matrix
- Polyline
// OBS: The other operations is calculated and it's result returned, then there's no object for this.

- - -

# Soon:
- More graphic functions;
- Search and fixing of bugs;
- More mathematical functions and operators;
- Site layout update;
- Helper as a page;

- - -

# Future Implementations:

## Function Definition:
f(x) = x+y

## Demarked Inner Expresions:
x + y; x = 1; y = 2; plot((x, y))

// OBJ: Order matter?

## Squared Root:
sqr(x)
√(x)
√x

## Connect Function:
connect(x, y, z...)

## Convertion:
Polyline(x)
Matrix(x)
Tuple(x)

# New Functions:
sum(x,y,...) or sum([x, y, z])

# Expression Reference:
expr[1]

# Set Theory
#

- - -

# Last Updates:

## Set Functions (prototype):
Now you can set your own functions with the sintaxe "f(x)=x+1...".

//OBS: A current bug is the function returning NaN if you use more than one function inside a function

\[Example\]:
f(x)=x+t(x)
t(x)=x+2
f(1) == 1+1+2 == 4

f(x)=x+t(x)+s(x)
t(x)=x+2
s(x)=x+3
f(1) == NaN

f(x)=x+t(x)
t(x)=x+2+s(x)
s(x)=x+3
f(1) == 1+1+2+1+3 == 8
// obs: the result is with delay

## Graphic
Now the zoom is not fixed at the origin, it zooms like the origin is always in the center of the pinch touch.

## New Operations and Functions
- Matrix sum;
- Matrix sub;
- sqrt(x);
- max(x, y, ..., z) or max((x, y, ..., z));
- min(x, y, ..., z) or min((x, y, ..., z));
- sum(x, y, ..., z) or sum((x, y, ..., z));
