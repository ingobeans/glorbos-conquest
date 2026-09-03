import { Card, LivingEntity, registerCard } from "../cards";

class Sorcerer implements Card, LivingEntity {
    name = "Sorcerer";
    health = 0;
}

export function register() {
    registerCard(new Sorcerer());
}