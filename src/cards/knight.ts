import { Card, LivingEntity, registerCard } from "../cards";
import { ElementType } from "../elements";

class Knight implements Card, LivingEntity {
    name = "Knight";
    health = 0;
    image = "knight";
    elementTypes = [ElementType.Light];
}

export function register() {
    registerCard(new Knight());
}