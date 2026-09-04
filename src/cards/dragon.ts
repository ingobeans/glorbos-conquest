import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";

class Dragon extends Card {
    name = "Dragon";
    image = "dragon";
    elementTypes = [ElementType.Fire, ElementType.Dark];
    maxHealth = 8;
}

export function register() {
    registerCard(new Dragon());
}