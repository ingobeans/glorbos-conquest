import { CardAction, CardActionResource } from "./card_actions";
import { ElementType } from "./elements";
import { PlacedCard } from "./engine";

/** Data stored for cards that reset for each round. */
export class CardRoundData {
    resources: { [key in CardActionResource]: number } = {
        [CardActionResource.Attack]: 1,
        [CardActionResource.Movement]: 1,
    }
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
    alive: boolean = true;
    die() {
        this.alive = false;
    }
    canStack(self: PlacedCard, other: PlacedCard): boolean { return false; }
    damage(amount: number): { died: boolean } {
        this.health -= amount;
        if (this.health <= 0.0) {
            this.die();
        }
        return { died: !this.alive };
    }
}

export let cardRegistry: Card[] = [];
export function registerCard(card: Card) {
    card.cardIndex = cardRegistry.length;
    card.health = card.maxHealth;
    cardRegistry.push(card);
}