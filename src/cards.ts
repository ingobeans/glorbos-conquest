import { ElementType } from "./elements";

export class Card {
    name: string = "Unknown";
    image: string = "";
    elementTypes: ElementType[] = [];
    maxHealth: number = 0;
    health: number = 0;
}

export let cardRegistry: Card[] = [];
export function registerCard(card: Card) {
    cardRegistry.push(card);
}