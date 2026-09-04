import { registerCard } from "./cards";

// cards
import Sorcerer = require("./cards/sorcerer");
import Knight = require("./cards/knight");
import Creb = require("./cards/creb");
import Wizard = require("./cards/wizard");
import Dragon = require("./cards/dragon");

// spellcards
import Fireball = require("./spellcards/fireball");

export function populate() {
    // cards
    Sorcerer.register();
    Knight.register();
    Creb.register();
    Wizard.register();
    Dragon.register();

    // spellcards
    Fireball.register();
}