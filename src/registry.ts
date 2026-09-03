import { registerCard } from "./cards";

// cards
import Sorcerer = require("./cards/sorcerer");

// spellcards
import Fireball = require("./spellcards/fireball");

export function populate() {
    // cards
    Sorcerer.register();

    // spellcards
    Fireball.register();
}