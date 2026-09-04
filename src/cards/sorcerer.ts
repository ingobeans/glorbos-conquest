import { Card, registerCard } from "../cards";

class Sorcerer extends Card {
    name = "Sorcerer";
    image = "sorcerer";
    elementTypes = [];
    maxHealth = 5;
}

export function register() {
    registerCard(new Sorcerer());
}