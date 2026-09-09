import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";

class Dragon extends Card {
    name = "Dragon";
    elementTypes = [ElementType.Fire, ElementType.Dark];
    maxHealth = 8;
}

export function register() {
    let types = [ElementType.Fire, ElementType.Water];
    for (let type of types) {
        let card = new Dragon();
        card.elementTypes[0] = type;
        card.image = "dragons/" + ElementType[type].toLowerCase();
        registerCard(card);
    }
}