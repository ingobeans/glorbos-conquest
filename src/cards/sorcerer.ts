import { Card, LivingEntity, registerCard } from "../cards";

class Sorcerer implements Card, LivingEntity {
    name = "Sorcerer";
    health = 0;
    image = "sorcerer";
    elementTypes = [];
}

export function register() {
    registerCard(new Sorcerer());
}