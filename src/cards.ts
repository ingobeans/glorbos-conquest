import { ElementType } from "./elements";
import { PlacedCard } from "./engine";

export class Card {
    name: string = "Unknown";
    image: string = "";
    elementTypes: ElementType[] = [];
    maxHealth: number = 0;
    health: number = 0;
    entityId: number = -1;
    canStack(self: PlacedCard, other: PlacedCard): boolean { return false; }
}

export let cardRegistry: Card[] = [];
export function registerCard(card: Card) {
    cardRegistry.push(card);
}