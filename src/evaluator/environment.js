export class Environment {

    constructor() {
        this.values = {};
        this.listeners = [];
        this.plotList = new Map();
        this.plotListeners = [];
    }

    set(name, value) {
        this.values[name] = value;

        this.listeners.forEach(listener => {
            listener(name, value);
        });
    }

    get(name) {
        return this.values[name];
    }

    addPlotListener(listener) {
        this.plotListeners.push(listener);
    }

    toPlot(id, content) {
        this.plotList.set(id, {
            id,
            content
        });
    }

    removePlot(id) {
        this.plotList.delete(id);
    }

    getPlots() {
        const l= [...this.plotList.values()];
        return l;
    }

    clearPlots() {
        this.plotList.clear();
    }

    onChange(listener) {
        this.listeners.push(listener);
    }
}