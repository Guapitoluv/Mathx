import { Matrix } from "../math/matrix.js";
import { Polyline } from "../math/polyline.js";


export class GraphCanvas {

    constructor(canvas) {
        canvas.width = 1200;
        canvas.height = 1200;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        
        this.objects = {};
        
        this.scale = 40;
        this.origin = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        
        this.lastDistance = null;
        this.lastTouch = null;
        this.lastMouse = null;
        this.mouseDown = false;
        
        
        // =========================================================
        // Mouse — PAN
        // =========================================================
        
        this.canvas.addEventListener("mousedown", e => {
            this.mouseDown = true;
        
            this.lastMouse = {
                x: e.clientX,
                y: e.clientY
            };
        });
        
        this.canvas.addEventListener("mousemove", e => {
            if (!this.mouseDown || !this.lastMouse)
                return;
        
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
        
            this.origin.x += dx * 3;
            this.origin.y += dy * 3;
        
            this.lastMouse = {
                x: e.clientX,
                y: e.clientY
            };
        
            this.draw();
        });
        
        this.canvas.addEventListener("mouseup", () => {
            this.mouseDown = false;
            this.lastMouse = null;
        });
        
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseDown = false;
            this.lastMouse = null;
        });
        
        
        // =========================================================
        // Mouse — ZOOM
        // =========================================================
        
        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
        
            const factor = e.deltaY < 0
                ? 1.1
                : 0.9;
        
            this.scale *= factor;
        
            this.scale = Math.max(
                5,
                Math.min(this.scale, 500)
            );
        
            this.draw();
        }, { passive: false });
        
        
        // =========================================================
        // Touch
        // =========================================================
        
        this.canvas.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
        
                this.lastTouch = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            }
        
            if (e.touches.length === 2) {
                this.lastDistance = this.getTouchDistance(e.touches);
                this.lastTouch = null;
            }
        });
        
        this.canvas.addEventListener("touchmove", e => {
            e.preventDefault();
        
            // PAN
            if (e.touches.length === 1) {
                const touch = e.touches[0];
        
                const dx = touch.clientX - this.lastTouch.x;
                const dy = touch.clientY - this.lastTouch.y;
        
                this.origin.x += dx * 3;
                this.origin.y += dy * 3;
        
                this.lastTouch = {
                    x: touch.clientX,
                    y: touch.clientY
                };
        
                this.draw();
                return;
            }
        
            // ZOOM
            if (e.touches.length === 2) {
                const distance = this.getTouchDistance(e.touches);
        
                if (this.lastDistance !== null) {
                    const factor = distance / this.lastDistance;
        
                    this.scale *= factor;
        
                    this.scale = Math.max(
                        5,
                        Math.min(this.scale, 500)
                    );
        
                    this.draw();
                }
        
                this.lastDistance = distance;
            }
        }, { passive: false });
        
        this.canvas.addEventListener("touchend", e => {
            if (e.touches.length === 0) {
                this.lastTouch = null;
                this.lastDistance = null;
            }
        
            if (e.touches.length === 1) {
                const touch = e.touches[0];
        
                this.lastTouch = {
                    x: touch.clientX,
                    y: touch.clientY
                };
        
                this.lastDistance = null;
            }
        });
        
        
        this.canvas.addEventListener("touchcancel", e => {
            if (e.touches.length === 0) {
                this.lastTouch = null;
                this.lastDistance = null;
            }
        
            if (e.touches.length === 1) {
                const touch = e.touches[0];
        
                this.lastTouch = {
                    x: touch.clientX,
                    y: touch.clientY
                };
        
                this.lastDistance = null;
            }
        });
    }
    
    getTouchDistance(touches) {
        const a = touches[0];
        const b = touches[1];
    
        return Math.hypot(
            a.clientX - b.clientX,
            a.clientY - b.clientY
        );
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    toCanvas(x, y) {
        return {
            x: this.origin.x + x * this.scale,
            y: this.origin.y - y * this.scale
        };
    }
    
    drawLine(start, end) {
        const startP = this.toCanvas(start.x, start.y);
        const endP = this.toCanvas(end.x, end.y);
        
        this.ctx.beginPath();
        this.ctx.fillStyle = "white";
        this.ctx.moveTo(startP.x, startP.y);
        this.ctx.lineTo(endP.x, endP.y);
        this.ctx.stroke();
    }

    drawPoint(x, y, radius = 5) {
        const p = this.toCanvas(x, y);
        
        this.ctx.beginPath();
        this.ctx.fillStyle = "white";
        this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTuple(tuple) {
        if (tuple.length !== 2)
            throw new Error("Expected (x,y)");

        this.drawPoint(tuple[0], tuple[1]);
    }

    drawMatrix(matrix) {

        if (matrix.rows === 2) {
            for (let i=0;i<matrix.cols;i++) {
                this.drawPoint(matrix.get(0, i), matrix.get(1, i));
            } 
        } else if (matrix.cols === 2) {
            for (let i=0;i<matrix.rows;i++) {
                this.drawPoint(matrix.get(i, 0), matrix.get(i, 1));
            } 
        }

    }
    
    drawPolyline(value) {
        if (value.points.length === 0)
            return;
    
        const first = this.toCanvas(...value.points[0]);
    
        this.ctx.beginPath();
        this.ctx.fillStyle = "gray";
        this.ctx.moveTo(first.x, first.y);
    
        for (let i = 1; i < value.points.length; i++) {
            const [x, y] = value.points[i];
            const p = this.toCanvas(x, y);
    
            this.ctx.lineTo(p.x, p.y);
        }
    
        this.ctx.stroke();
            
        for (let [x,y] of value.points) {
            this.drawPoint(x, y);
        }
    }

    getAxisStep() {
    // Distância desejada entre números, em pixels.
    const targetPixels = 80;

    const rawStep = targetPixels / this.scale;

    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const normalized = rawStep / magnitude;

    let step;

    if (normalized < 2) {
        step = 1;
    } else if (normalized < 5) {
        step = 2;
    } else {
        step = 5;
    }

    return step * magnitude;
}

drawAxisTicks() {
    const ctx = this.ctx;
    const step = this.getAxisStep();

    // Intervalo matemático visível
    const minX = -this.origin.x / this.scale;
    const maxX = (this.canvas.width - this.origin.x) / this.scale;

    const minY = (this.origin.y - this.canvas.height) / this.scale;
    const maxY = this.origin.y / this.scale;

    // Primeiro múltiplo de step dentro da área visível
    const firstX = Math.ceil(minX / step) * step;
    const firstY = Math.ceil(minY / step) * step;

    // =========================
    // Eixo X
    // =========================

    for (let x = firstX; x <= maxX; x += step) {
        // Evita erros de ponto flutuante
        x = Number(x.toPrecision(12));

        if (Math.abs(x) < step * 0.001)
            continue;

        const px = this.origin.x + x * this.scale;

        ctx.beginPath();
        ctx.moveTo(px, this.origin.y - 5);
        ctx.lineTo(px, this.origin.y + 5);
        ctx.stroke();
    }

    // =========================
    // Eixo Y
    // =========================

    for (let y = firstY; y <= maxY; y += step) {
        y = Number(y.toPrecision(12));

        if (Math.abs(y) < step * 0.001)
            continue;

        const py = this.origin.y - y * this.scale;

        ctx.beginPath();
        ctx.moveTo(this.origin.x - 5, py);
        ctx.lineTo(this.origin.x + 5, py);
        ctx.stroke();
    }
}

formatAxisValue(value) {
    // Evita coisas como 0.30000000000000004
    const rounded = Number(value.toPrecision(12));

    if (Number.isInteger(rounded))
        return String(rounded);

    return String(rounded);
}

drawAxisLabels() {
    const ctx = this.ctx;
    const step = this.getAxisStep();

    const minX = -this.origin.x / this.scale;
    const maxX = (this.canvas.width - this.origin.x) / this.scale;

    const minY = (this.origin.y - this.canvas.height) / this.scale;
    const maxY = this.origin.y / this.scale;

    const firstX = Math.ceil(minX / step) * step;
    const firstY = Math.ceil(minY / step) * step;

    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // =========================
    // Valores do eixo X
    // =========================

    for (let x = firstX; x <= maxX; x += step) {
        x = Number(x.toPrecision(12));

        if (Math.abs(x) < step * 0.001)
            continue;

        const px = this.origin.x + x * this.scale;

        ctx.fillText(
            this.formatAxisValue(x),
            px,
            this.origin.y + 9
        );
    }

    // =========================
    // Valores do eixo Y
    // =========================

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let y = firstY; y <= maxY; y += step) {
        y = Number(y.toPrecision(12));

        if (Math.abs(y) < step * 0.001)
            continue;

        const py = this.origin.y - y * this.scale;

        ctx.fillText(
            this.formatAxisValue(y),
            this.origin.x + 9,
            py
        );
    }

    // =========================
    // Origem
    // =========================

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText(
        "0",
        this.origin.x + 7,
        this.origin.y + 7
    );
}

drawAxes() {
    const ctx = this.ctx;

    // Eixos
    ctx.beginPath();

    ctx.moveTo(0, this.origin.y);
    ctx.lineTo(this.canvas.width, this.origin.y);

    ctx.moveTo(this.origin.x, 0);
    ctx.lineTo(this.origin.x, this.canvas.height);

    ctx.stroke();

    // Enumeração
    this.drawAxisTicks();
    this.drawAxisLabels();
}
    
    draw(objects = this.objects) {
        this.clear();
        this.drawAxes();
        
        if (Array.isArray(objects)) {
            this.objects = {};
    
            for (const object of objects) {
                this.objects[object.id] = object.content;
            }
        }
        for (const object of Object.values(this.objects)) {
    
            if (object instanceof Polyline) {
                this.drawPolyline(object);
    
            } else if (object instanceof Matrix) {
                this.drawMatrix(object);
    
            } else if (Array.isArray(object)) {
                this.drawTuple(object);
            }
        }
    }
}