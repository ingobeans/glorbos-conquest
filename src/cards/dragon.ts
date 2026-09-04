import { Card, LivingEntity, registerCard } from "../cards";
import { ElementType } from "../elements";

class Dragon implements Card, LivingEntity {
    name = "Dragon";
    health = 0;
    image = "dragon";
    elementTypes = [ElementType.Fire, ElementType.Dark];
}

export function register() {
    registerCard(new Dragon());
}