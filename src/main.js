import { ExpressionsHandler } from "./ui/expressions_handler.js";
import { graph } from "./data.js";

const eh=new ExpressionsHandler()
graph.draw();

eh.init()