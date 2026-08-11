import { Matrix } from "../math/matrix.js";
import { Polyline } from "../math/polyline.js";
import { MouseHandler } from "./mouse_handler.js";
import { TouchHandler } from "./touch_handler.js";

export class GraphCanvas {

    constructor(canvas) {
        canvas.width = 1200;
        canvas.height = 1200;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        
        this.mouseHandler = new MouseHandler(this);
        this.touchHandler = new TouchHandler(this);
        this.objects = {};

        this.scale = 40;

        this.origin = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        
        this.mouseHandler.setEvents();
        this.touchHandler.setEvents();
    }


    // =============================================================
    // Coordenadas
    // =============================================================

    getCanvasPoint(clientX, clientY) {

        const rect =
            this.canvas.getBoundingClientRect();

        return {
            x:
                (clientX - rect.left) *
                (this.canvas.width / rect.width),

            y:
                (clientY - rect.top) *
                (this.canvas.height / rect.height)
        };
    }


    getTouchCenter(touches) {

        const a = touches[0];
        const b = touches[1];

        return {
            x: (a.clientX + b.clientX) / 2,
            y: (a.clientY + b.clientY) / 2
        };
    }


    getTouchDistance(touches) {

        const a = touches[0];
        const b = touches[1];

        return Math.hypot(
            a.clientX - b.clientX,
            a.clientY - b.clientY
        );
    }


    // =============================================================
    // ZOOM
    // =============================================================

    zoom(
        factor,
        centerX = this.canvas.width / 2,
        centerY = this.canvas.height / 2
    ) {

        const oldScale = this.scale;

        const newScale = Math.max(
            5,
            Math.min(oldScale * factor, 500)
        );


        // Não houve mudança
        if (newScale === oldScale)
            return;


        // ---------------------------------------------------------
        // Descobre qual ponto matemático está sob o cursor
        // ---------------------------------------------------------

        const worldX =
            (centerX - this.origin.x) /
            oldScale;

        const worldY =
            (this.origin.y - centerY) /
            oldScale;


        // ---------------------------------------------------------
        // Aplica a nova escala
        // ---------------------------------------------------------

        this.scale = newScale;


        // ---------------------------------------------------------
        // Mantém o mesmo ponto sob o cursor
        // ---------------------------------------------------------

        this.origin.x =
            centerX -
            worldX * newScale;

        this.origin.y =
            centerY +
            worldY * newScale;
    }


    // =============================================================
    // Canvas
    // =============================================================

    clear() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    // =============================================================
    // Coordenadas matemáticas → Canvas
    // =============================================================

    toCanvas(x, y) {

        return {
            x:
                this.origin.x +
                x * this.scale,

            y:
                this.origin.y -
                y * this.scale
        };
    }


    // =============================================================
    // Desenho
    // =============================================================

    drawLine(start, end) {

        const startP =
            this.toCanvas(
                start.x,
                start.y
            );

        const endP =
            this.toCanvas(
                end.x,
                end.y
            );


        this.ctx.beginPath();

        this.ctx.moveTo(
            startP.x,
            startP.y
        );

        this.ctx.lineTo(
            endP.x,
            endP.y
        );

        this.ctx.stroke();
    }


    drawPoint(x, y, radius = 5) {

        const p =
            this.toCanvas(x, y);

        this.ctx.beginPath();

        this.ctx.fillStyle = "white";

        this.ctx.arc(
            p.x,
            p.y,
            radius,
            0,
            Math.PI * 2
        );

        this.ctx.fill();
    }


    drawTuple(tuple) {

        if (tuple.length !== 2)
            throw new Error("Expected (x,y)");

        this.drawPoint(
            tuple[0],
            tuple[1]
        );
    }


    drawMatrix(matrix) {

        if (matrix.rows === 2) {

            for (
                let i = 0;
                i < matrix.cols;
                i++
            ) {

                this.drawPoint(
                    matrix.get(0, i),
                    matrix.get(1, i)
                );
            }

        } else if (matrix.cols === 2) {

            for (
                let i = 0;
                i < matrix.rows;
                i++
            ) {

                this.drawPoint(
                    matrix.get(i, 0),
                    matrix.get(i, 1)
                );
            }
        }
    }


    drawPolyline(value) {

        if (value.points.length === 0)
            return;


        const first =
            this.toCanvas(
                ...value.points[0]
            );


        this.ctx.beginPath();

        this.ctx.moveTo(
            first.x,
            first.y
        );


        for (
            let i = 1;
            i < value.points.length;
            i++
        ) {

            const [x, y] =
                value.points[i];

            const p =
                this.toCanvas(x, y);

            this.ctx.lineTo(
                p.x,
                p.y
            );
        }


        this.ctx.stroke();


        for (const [x, y] of value.points) {
            this.drawPoint(x, y);
        }
    }


    // =============================================================
    // Eixos
    // =============================================================

    getAxisStep() {

        // Distância desejada entre números em pixels
        const targetPixels = 80;

        const rawStep =
            targetPixels / this.scale;


        const magnitude =
            10 ** Math.floor(
                Math.log10(rawStep)
            );


        const normalized =
            rawStep / magnitude;


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

        const step =
            this.getAxisStep();


        // ---------------------------------------------------------
        // Intervalo matemático visível
        // ---------------------------------------------------------

        const minX =
            -this.origin.x /
            this.scale;

        const maxX =
            (this.canvas.width - this.origin.x) /
            this.scale;


        const minY =
            (this.origin.y - this.canvas.height) /
            this.scale;

        const maxY =
            this.origin.y /
            this.scale;


        const firstX =
            Math.ceil(minX / step) *
            step;

        const firstY =
            Math.ceil(minY / step) *
            step;


        // ---------------------------------------------------------
        // Eixo X
        // ---------------------------------------------------------

        for (
            let x = firstX;
            x <= maxX;
            x += step
        ) {

            x =
                Number(
                    x.toPrecision(12)
                );


            if (
                Math.abs(x) <
                step * 0.001
            ) {
                continue;
            }


            const px =
                this.origin.x +
                x * this.scale;


            ctx.beginPath();

            ctx.moveTo(
                px,
                this.origin.y - 5
            );

            ctx.lineTo(
                px,
                this.origin.y + 5
            );

            ctx.stroke();
        }


        // ---------------------------------------------------------
        // Eixo Y
        // ---------------------------------------------------------

        for (
            let y = firstY;
            y <= maxY;
            y += step
        ) {

            y =
                Number(
                    y.toPrecision(12)
                );


            if (
                Math.abs(y) <
                step * 0.001
            ) {
                continue;
            }


            const py =
                this.origin.y -
                y * this.scale;


            ctx.beginPath();

            ctx.moveTo(
                this.origin.x - 5,
                py
            );

            ctx.lineTo(
                this.origin.x + 5,
                py
            );

            ctx.stroke();
        }
    }


    formatAxisValue(value) {
        const rounded =
            Number(
                value.toPrecision(12)
            );


        if (Number.isInteger(rounded))
            return String(rounded);

        return String(rounded);
    }


    drawAxisLabels() {

        const ctx = this.ctx;

        const step =
            this.getAxisStep();


        const minX =
            -this.origin.x /
            this.scale;

        const maxX =
            (this.canvas.width - this.origin.x) /
            this.scale;


        const minY =
            (this.origin.y - this.canvas.height) /
            this.scale;

        const maxY =
            this.origin.y /
            this.scale;


        const firstX =
            Math.ceil(minX / step) *
            step;

        const firstY =
            Math.ceil(minY / step) *
            step;


        ctx.font =
            "24px sans-serif";


        // ---------------------------------------------------------
        // Valores do eixo X
        // ---------------------------------------------------------

        ctx.textAlign = "center";
        ctx.textBaseline = "top";


        for (
            let x = firstX;
            x <= maxX;
            x += step
        ) {

            x =
                Number(
                    x.toPrecision(12)
                );


            if (
                Math.abs(x) <
                step * 0.001
            ) {
                continue;
            }


            const px =
                this.origin.x +
                x * this.scale;


            ctx.fillText(
                this.formatAxisValue(x),
                px,
                this.origin.y + 9
            );
        }


        // ---------------------------------------------------------
        // Valores do eixo Y
        // ---------------------------------------------------------

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";


        for (
            let y = firstY;
            y <= maxY;
            y += step
        ) {

            y =
                Number(
                    y.toPrecision(12)
                );


            if (
                Math.abs(y) <
                step * 0.001
            ) {
                continue;
            }


            const py =
                this.origin.y -
                y * this.scale;


            ctx.fillText(
                this.formatAxisValue(y),
                this.origin.x + 9,
                py
            );
        }


                // ---------------------------------------------------------
        // Origem
        // ---------------------------------------------------------

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
        
        // ---------------------------------------------------------
        // Eixos
        // ---------------------------------------------------------
        
        ctx.beginPath();
        ctx.fillStyle = "black";
        
        // Eixo X
        ctx.moveTo(0, this.origin.y);

        ctx.lineTo(
            this.canvas.width,
            this.origin.y
        );
        
        // Eixo Y
        ctx.moveTo(this.origin.x, 0);

        ctx.lineTo(
            this.origin.x,
            this.canvas.height
        );
        
        ctx.stroke();
        
        // ---------------------------------------------------------
        // Enumeração
        // ---------------------------------------------------------

        this.drawAxisTicks();
        this.drawAxisLabels();
    }
    
    // =============================================================
    // Renderização
    // =============================================================

    draw(objects = this.objects) {
        this.clear();
        this.drawAxes();
        
        // ---------------------------------------------------------
        // Atualiza objetos
        // ---------------------------------------------------------

        if (Array.isArray(objects)) {
            this.objects = {};
            
            for (const object of objects) {
                this.objects[object.id] = object.content;
            }
        }
        
        // ---------------------------------------------------------
        // Desenha objetos
        // ---------------------------------------------------------

        for (
            const object
            of Object.values(this.objects)
        ) {

            if (object instanceof Polyline)
                this.drawPolyline(object);
            
            else if (object instanceof Matrix)
                this.drawMatrix(object);
            
            else if (Array.isArray(object))
                this.drawTuple(object);
        }
    }
}