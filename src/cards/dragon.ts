import { CardAction, fireBreathCardAction, moveCardAction, waterSprayCardAction } from "../card_actions";
import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";

class Dragon extends Card {
    name = "Dragon";
    elementTypes = [ElementType.Fire, ElementType.Dark];
    maxHealth = 8;
    actions: CardAction[] = [moveCardAction];
}

export function register() {
    let types: [ElementType, string, CardAction][] = [
        [ElementType.Fire, "Red", fireBreathCardAction],
        [ElementType.Water, "Water", waterSprayCardAction],
    ];
    for (let type of types) {
        let card = new Dragon();
        card.elementTypes[0] = type[0];
        card.image = "dragons/" + ElementType[type[0]].toLowerCase();
        card.name = `${type[1]} Dragon`;
        card.actions.push(type[2]);
        registerCard(card);
    }
}