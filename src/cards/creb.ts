import { Card, registerCard } from "../cards";

class Creb extends Card {
    name = "Creb";
    image = "creb";
    elementTypes = [];
    maxHealth = 8;
}

export function register() {
    registerCard(new Creb());
}