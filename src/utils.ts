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

export class EncodedPacket<Type> {
    typeIndex: number;
    value: Type;
    constructor(typeIndex: number, value: Type) {
        this.typeIndex = typeIndex;
        this.value = value;
    }
}

export function encodePacket(data: Object, registry: any[]): string {
    let index = -1;
    for (let [i, ty] of registry.entries()) {
        if (data instanceof ty.constructor) {
            index = i;
        }
    }
    let packet = new EncodedPacket(index, data);
    let packetEncoded = JSON.stringify(packet);
    return packetEncoded;
}

export function decodePacket<Type>(encoded: string, registry: Type[]): Type {
    let decodedPacket = <EncodedPacket<Object>>JSON.parse(encoded);
    let type = registry[decodedPacket.typeIndex];
    if (!type)
        throw Error("bad packet");

    let extractedPacket = Object.setPrototypeOf(decodedPacket.value, type);
    return extractedPacket;
}

(<any>globalThis).clone = clone;