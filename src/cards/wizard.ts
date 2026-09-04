import { Card, registerCard } from "../cards";

class Wizard extends Card {
    name = "Wizard";
    image = "wizard";
    elementTypes = [];
    maxHealth = 4;
}

export function register() {
    registerCard(new Wizard());
}