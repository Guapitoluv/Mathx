import { GraphCanvas } from "./graphics/drawCanvas.js";
import { Environment } from "./evaluator/environment.js";


const canvas = document.getElementById("display");
export const environment = new Environment();
export const graph = new GraphCanvas(canvas);