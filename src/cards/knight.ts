import { CardAction, meleeAttackCardAction, moveCardAction } from "../card_actions";
import { Card, registerCard } from "../cards";
import { ElementType } from "../elements";
import { PlacedCard } from "../engine";

class Knight extends Card {
    name = "Knight";
    image = "knight";
    desc = "A mighty knight who fights for the light."
    elementTypes = [ElementType.Light];
    maxHealth = 6;
    actions = [
        moveCardAction,
        meleeAttackCardAction
    ];
}

export function register() {
    registerCard(new Knight());
}