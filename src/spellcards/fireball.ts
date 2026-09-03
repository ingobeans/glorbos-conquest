import { registerSpellCard, SpellCard } from "../spellcards";

class Fireball implements SpellCard {
    name = "Fireball";
}

export function register() {
    registerSpellCard(new Fireball());
}