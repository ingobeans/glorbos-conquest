export interface Card {
    name: string;
}
export interface LivingEntity {
    health: number;
}
export function isLiving(arg: any): arg is LivingEntity {
    return "health" in arg;
}

export let cardRegistry: Card[] = [];
export function registerCard(card: Card) {
    cardRegistry.push(card);
}