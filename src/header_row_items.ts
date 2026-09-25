import { Card } from "./cards";
import { PlacedCard } from "./engine";

export function addHearts(parent: HTMLElement, max: number | Card, health: number | undefined = undefined) {
    if (max instanceof Card) {
        if (health === undefined) {
            health = max.health;
        }
        max = max.maxHealth;
    }
    if (health === undefined) {
        health = max;
    }
    for (let i = 0; i < max / 2; i++) {
        let image = document.createElement("img");
        image.classList.add("card-heart");
        let heartType = "heart_full";
        if (i != max / 2 && i == Math.floor(max / 2)) {
            heartType = "heart_half";
        }
        if (health / 2 <= i) {
            heartType += "_missing";
        } else if (Math.floor(health / 2) <= i && heartType != "heart_half") {
            heartType += "_missing_half";
        }
        else {
            heartType += "_present";
        }
        if (heartType == "heart_half_missing_half") {
            heartType = "heart_half_missing";
        }
        image.src = `assets/graphics/${heartType}.png`;
        parent.appendChild(image);
    }
}

export interface ActionHeaderRowItem {
    generateElement(card: PlacedCard): HTMLElement
}

export class HeartHeaderRowItem implements ActionHeaderRowItem {
    amt: number;
    constructor(amt: number) {
        this.amt = amt;
    }
    generateElement(card: PlacedCard): HTMLElement {
        let container = document.createElement("div");
        container.classList.add("card-info-hearts");
        container.classList.add("card-info-action-hearts");
        addHearts(container, this.amt);
        return container;
    }
}