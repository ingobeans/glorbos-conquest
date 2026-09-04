export enum ElementType {
    Fire,
    Water,
    Grass,
    Steel,
    Earth,
    Electric,

    Dark,
    Light,
}
export let elementMatchups = {
    [ElementType.Fire]: [ElementType.Grass, ElementType.Steel],
    [ElementType.Water]: [ElementType.Fire, ElementType.Earth],
    [ElementType.Grass]: [ElementType.Water, ElementType.Earth, ElementType.Steel],
    [ElementType.Steel]: [ElementType.Water, ElementType.Grass],
    [ElementType.Earth]: [ElementType.Electric, ElementType.Fire],
    [ElementType.Electric]: [ElementType.Steel, ElementType.Water],

    [ElementType.Light]: <ElementType[]>[],
    [ElementType.Dark]: <ElementType[]>[],
}
export function getModifier(attacker: ElementType, victim: ElementType): number {
    let modifier = 1.0;

    let attackerStrongAgainst = elementMatchups[attacker];
    if (attackerStrongAgainst && attackerStrongAgainst.includes(victim)) {
        modifier *= 2.0;
    }

    let victimStrongAgainst = elementMatchups[victim];
    if (victimStrongAgainst && victimStrongAgainst.includes(attacker)) {
        modifier /= 2.0;
    }

    return modifier;
}