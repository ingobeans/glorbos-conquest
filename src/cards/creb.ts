import { Card, LivingEntity, registerCard } from "../cards";

class Creb implements Card, LivingEntity {
    name = "Creb";
    health = 0;
    image = "creb";
    elementTypes = [];
}

export function register() {
    registerCard(new Creb());
}