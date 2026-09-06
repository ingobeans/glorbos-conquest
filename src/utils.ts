export function clone<Type extends Object>(object: Type): Type {
    if (object instanceof Array) {
        let cloned = [];
        for (let value of object) {
            if (value instanceof Object) {
                value = clone(value);
            }
            cloned.push(value);
        }
        return <any>cloned;
    }
    let cloned = Object.create(object);

    for (let [key, value] of Object.entries(object)) {
        if (value instanceof Object) {
            value = clone(value);
        }
        cloned[key] = value;
    }
    return cloned;
}

export function clamp(v: number, min: number, max: number): number {
    return Math.max(Math.min(v, max), min);
}

export class Packet<Type> {
    typeIndex: number;
    value: Type;
    constructor(typeIndex: number, value: Type) {
        this.typeIndex = typeIndex;
        this.value = value;
    }
}

(<any>globalThis).clone = clone;