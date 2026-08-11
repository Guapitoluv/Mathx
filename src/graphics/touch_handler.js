export class TouchHandler {
    constructor(drawer) {
        this.drawer = drawer;
        this.lastTouch = null;
        this.lastDistance = null;
        this.lastTouchCenter = null;
    }
    
    setEvents() {
        this.drawer.canvas.addEventListener("touchstart", e => {
            this.touchStart(e);
        }, { passive: false });
        
        this.drawer.canvas.addEventListener("touchmove", e => {
            this.touchMove(e);
        }, { passive: false });
        
        this.drawer.canvas.addEventListener("touchend", e => {
            this.touchCancel(e)
        });

        this.drawer.canvas.addEventListener("touchcancel", e => {
            this.touchCancel(e);
        });
    }
    
    touchStart(e) {
        e.preventDefault();
        
        switch (e.touches.length) {
            case 1: {
                const touch = e.touches[0];
                
                this.lastTouch =
                    this.drawer.getCanvasPoint(
                        touch.clientX,
                        touch.clientY
                    );
                
                this.lastDistance = null;
                this.lastTouchCenter = null;
                
                return;
            }
            
            case 2: {
                const center =
                    this.drawer.getTouchCenter(e.touches);
                
                this.lastDistance =
                    this.drawer.getTouchDistance(e.touches);
                
                this.lastTouchCenter =
                    this.drawer.getCanvasPoint(
                        center.x,
                        center.y
                    );
    
                this.lastTouch = null;
            }
        }
    }
    
    touchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            
            const current =
                this.drawer.getCanvasPoint(
                    touch.clientX,
                    touch.clientY
                );
            
            if (this.lastTouch) {
                const dx =
                    current.x - this.lastTouch.x;
                
                const dy =
                    current.y - this.lastTouch.y;
                
                this.drawer.origin.x += dx;
                this.drawer.origin.y += dy;
            }
            
            this.lastTouch = current;
            
            this.drawer.draw();
            return;
        }
        
        if (e.touches.length === 2) {
            const distance =
                this.drawer.getTouchDistance(e.touches);
            
            const center =
                this.drawer.getTouchCenter(e.touches);
            
            const currentCenter =
                this.drawer.getCanvasPoint(
                    center.x,
                    center.y
                );
            
            if (
                this.lastDistance !== null &&
                this.lastTouchCenter !== null
            ) {
                const factor =
                    distance / this.lastDistance;
                
                this.drawer.zoom(
                    factor,
                    this.lastTouchCenter.x,
                    this.lastTouchCenter.y
                );
                
                const dx =
                    currentCenter.x -
                    this.lastTouchCenter.x;
                
                const dy =
                    currentCenter.y -
                    this.lastTouchCenter.y;
                
                this.drawer.origin.x += dx;
                this.drawer.origin.y += dy;
                
                this.drawer.draw();
            }
            
            this.lastDistance = distance;
            this.lastTouchCenter = currentCenter;
        }
    }
    
    touchCancel(e) {
        switch (e.touches.length) {
            
            case 0: {
                this.lastTouch = null;
                this.lastDistance = null;
                this.lastTouchCenter = null;
                
                return;
            }
            
            case 1: {
                const touch = e.touches[0];
                
                this.lastTouch =
                    this.drawer.getCanvasPoint(
                        touch.clientX,
                        touch.clientY
                    );
    
                this.lastDistance = null;
                this.lastTouchCenter = null;
            }
        }
    }
}