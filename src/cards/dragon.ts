import { Card, LivingEntity, registerCard } from "../cards";

class Dragon implements Card, LivingEntity {
    name = "Dragon";
    health = 0;
    image = "dragon";
}

export function register() {
    registerCard(new Dragon());
}