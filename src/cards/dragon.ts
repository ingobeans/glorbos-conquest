import { BreathAttackCardAction, MoveCardAction } from "../card_actions";
import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";

class Dragon extends Card {
    name = "Dragon";
    elementTypes = [ElementType.Fire, ElementType.Dark];
    maxHealth = 8;
    actions = [MoveCardAction.prototype, BreathAttackCardAction.prototype];
}

export function register() {
    let types: [ElementType, string][] = [
        [ElementType.Fire, "Red"],
        [ElementType.Water, "Water"],
    ];
    for (let type of types) {
        let card = new Dragon();
        card.elementTypes[0] = type[0];
        card.image = "dragons/" + ElementType[type[0]].toLowerCase();
        card.name = `${type[1]} Dragon`;
        registerCard(card);
    }
}