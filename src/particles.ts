import { BoardPosition } from "./board";

export class Particle {
    activeElement: HTMLElement | null = null;
    position: BoardPosition;
    life: number = 0.0;
    customCreateElement(): HTMLElement {
        return document.createElement("div");
    }
    /** Don't overwrite this function in child particles, use `customCreateElement` */
    createElement(): HTMLElement {
        let element = this.customCreateElement();
        element.style.setProperty("--x", this.position.x.toString());
        element.style.setProperty("--y", this.position.y.toString());
        this.activeElement = element;
        return element;
    }
    constructor(position: BoardPosition) {
        this.position = position;
    }
    /** Returns true if particle should despawn */
    update(deltaTime: number): boolean {
        this.life += deltaTime;
        return false;
    }
}

export class FireParticle extends Particle {
    /** Gif doesn't loop so this doesn't have to be the exact length of the gif */
    maxLife: number = 1000.0;
    customCreateElement(): HTMLElement {
        let e = super.customCreateElement();
        e.classList.add("highlight-tile");
        e.classList.add("animated");
        e.style.setProperty("--img", `url("assets/particles/fire.png")`);
        e.style.setProperty("--img-count", "7");
        e.style.opacity = "1";
        return e;
    }
    update(deltaTime: number) {
        super.update(deltaTime);
        return this.life >= this.maxLife;
    }
}

export let particlesRegistry: Particle[] = [
    FireParticle.prototype,
]