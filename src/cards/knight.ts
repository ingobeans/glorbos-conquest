import { Card, LivingEntity, registerCard } from "../cards";

class Knight implements Card, LivingEntity {
    name = "Knight";
    health = 0;
    image = "knight";
}

export function register() {
    registerCard(new Knight());
}