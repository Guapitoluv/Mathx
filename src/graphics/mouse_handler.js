export class MouseHandler {
    constructor(drawer) {
        this.drawer = drawer;
        this.isMouseDown = false;
        this.lastMouse = null;
    }
    
    setEvents() {
        this.drawer.canvas.addEventListener("mousedown", e => this.mouseDown(e));
        this.drawer.canvas.addEventListener("mousemove", e => this.mouseMove(e));
        this.drawer.canvas.addEventListener("mouseup", () => this.mouseCancel());
        this.drawer.canvas.addEventListener("mouseleave", () => this.mouseCancel());
        
        this.drawer.canvas.addEventListener("wheel", e => {
            this.wheel(e)
        }, { passive: false });
    }
    
    mouseMove(e) {
        if (!this.isMouseDown || !this.lastMouse) return;
        
        const mouse = this.getCanvasPoint(
            e.clientX,
            e.clientY
        );
        
        const dx = mouse.x - this.lastMouse.x;
        const dy = mouse.y - this.lastMouse.y;
        
        this.origin.x += dx;
        this.origin.y += dy;
        
        this.lastMouse = mouse;
        
        this.drawer.draw();
    }
    
    wheel(e) {
        e.preventDefault();
        
        const mouse = this.drawer.getCanvasPoint(
            e.clientX,
            e.clientY
        );

        const factor = e.deltaY < 0
            ? 1.1
            : 0.9;

        this.drawer.zoom(
            factor,
            mouse.x,
            mouse.y
        );

        this.drawer.draw();
    }
    
    mouseDown(e) {
        this.isMouseDown = true;
        
        this.lastMouse = this.getCanvasPoint(
            e.clientX,
            e.clientY
        );
    }
    
    mouseCance() {
        this.isMouseDown = false;
        this.lastMouse = null;
    }
}