import { ExpressionEngine } from "./expression_engine.js";
import { ExpressionsHandler } from "./ui/expressions_handler.js";
import { environment, graph } from "./data.js";

const ee=new ExpressionEngine(environment);
const eh=new ExpressionsHandler(ee);
graph.draw();