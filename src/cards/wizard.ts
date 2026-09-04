import { Card, LivingEntity, registerCard } from "../cards";

class Wizard implements Card, LivingEntity {
    name = "Wizard";
    health = 0;
    image = "wizard";
    elementTypes = [];
}

export function register() {
    registerCard(new Wizard());
}