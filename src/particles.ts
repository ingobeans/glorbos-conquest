import { BoardPosition } from "./board";

export class Particle {
    baseElement: string = "div";
    position: BoardPosition;
    life: number = 0.0;
    createElement(): HTMLElement {
        let element = document.createElement(this.baseElement);
        element.style.setProperty("--x", this.position.x.toString());
        element.style.setProperty("--y", this.position.y.toString());
        return element;
    }
    constructor(position: BoardPosition) {
        this.position = position;
    }
    update(deltaTime: number) {
        this.life += deltaTime;
    }
}

export class FireParticle extends Particle {
    createElement(): HTMLElement {
        let e = super.createElement();
        e.classList.add("highlight-tile");
        e.style.setProperty("--img", `url("assets/particles/fire.gif")`);
        e.style.opacity = "1";
        return e;
    }
    update(deltaTime: number) {
        super.update(deltaTime);
    }
}

export let particlesRegistry: Particle[] = [
    FireParticle.prototype,
]