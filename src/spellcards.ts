export interface SpellCard {
    name: string;
}

export let spellCardRegistry: SpellCard[] = [];
export function registerSpellCard(card: SpellCard) {
    spellCardRegistry.push(card);
}