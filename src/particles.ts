import { BoardPosition } from "./board";

export class Particle {
    position: BoardPosition;
    life: number = 0.0;
    constructor(position: BoardPosition) {
        this.position = position;
    }
    update(deltaTime: number) {
        this.life += deltaTime;
    }
}
export class ElementParticle extends Particle {
    element: HTMLElement;
    life: number = 0.0;
    createElement(): HTMLElement {
        return document.createElement("div");
    }
    constructor(position: BoardPosition) {
        super(position);
        this.element = this.createElement();
        this.element.style.setProperty("--x", position.x.toString());
        this.element.style.setProperty("--y", position.y.toString());
    }
}

export class FireParticle extends ElementParticle {
    createElement(): HTMLElement {
        let e = document.createElement("div");
        e.classList.add("highlight-tile");
        e.style.setProperty("--img", `url("assets/particles/fire.gif")`);
        e.style.opacity = "1";
        return e;
    }
    update(deltaTime: number) {
        super.update(deltaTime);
    }
}