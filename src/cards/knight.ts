import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";

class Knight extends Card {
    name = "Knight";
    image = "knight";
    elementTypes = [ElementType.Light];
    maxHealth = 6;
}

export function register() {
    registerCard(new Knight());
}