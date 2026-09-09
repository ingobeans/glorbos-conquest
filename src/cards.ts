import { CardAction } from "./card_actions";
import { ElementType } from "./elements";
import { PlacedCard } from "./engine";

/** Data stored for cards that reset for each round. */
export class CardRoundData {
    hasMoved: undefined | number = undefined;

}

export class Card {
    name: string = "Unknown";
    image: string = "";
    elementTypes: ElementType[] = [];
    roundData: CardRoundData = new CardRoundData();
    maxHealth: number = 0;
    health: number = 0;
    entityId: number = -1;
    cardIndex: number = -1;
    actions: CardAction[] = [];
    canStack(self: PlacedCard, other: PlacedCard): boolean { return false; }
}

export let cardRegistry: Card[] = [];
export function registerCard(card: Card) {
    card.cardIndex = cardRegistry.length;
    cardRegistry.push(card);
}