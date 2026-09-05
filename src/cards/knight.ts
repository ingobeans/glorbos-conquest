import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";
import { PlacedCard } from "../engine";

class Knight extends Card {
    name = "Knight";
    image = "knight";
    elementTypes = [ElementType.Light];
    maxHealth = 6;
}

export function register() {
    registerCard(new Knight());
}