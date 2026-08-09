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

    drawAxes() {
        const ctx = this.ctx;

        ctx.beginPath();

        // eixo x
        ctx.moveTo(0, this.origin.y);
        ctx.lineTo(this.canvas.width, this.origin.y);

        // eixo y
        ctx.moveTo(this.origin.x, 0);
        ctx.lineTo(this.origin.x, this.canvas.height);

        ctx.stroke();
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