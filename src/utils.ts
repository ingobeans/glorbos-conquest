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

export class PacketEncodeOptions {
    skipKeys: string[];
    constructor(skipKeys: string[]) {
        this.skipKeys = skipKeys;
    }
}

export const defaultPacketEncodeOptions = new PacketEncodeOptions([]);
export const cardActionEncodeOptions = new PacketEncodeOptions(["desc"]);

export function createEncodedPacket<Type extends Object>(data: Type, registry: any[], encodeOptions: PacketEncodeOptions = defaultPacketEncodeOptions): EncodedPacket<Type> {
    let index = -1;
    for (let [i, ty] of registry.entries()) {
        if (data instanceof ty.constructor) {
            index = i;
        }
    }
    if (encodeOptions.skipKeys.length > 0) {
        data = clone(data);
        for (let key of encodeOptions.skipKeys) {
            (<any>data)[key] = undefined;
        }
    }
    let packet = new EncodedPacket(index, data);
    return packet;
}

export function encodePacket(data: Object, registry: any[], encodeOptions: PacketEncodeOptions = defaultPacketEncodeOptions): string {
    let packet = createEncodedPacket(data, registry, encodeOptions);
    let packetEncoded = JSON.stringify(packet);
    return packetEncoded;
}

export function decodePacket<Type>(encoded: string | EncodedPacket<Type>, registry: Type[]): Type {
    let encodedPacket: EncodedPacket<Type>;
    if (typeof encoded == "string") {
        encodedPacket = <EncodedPacket<Type>>JSON.parse(encoded);
    } else {
        encodedPacket = encoded;
    }
    let type = registry[encodedPacket.typeIndex];
    if (!type)
        throw Error("bad packet");

    let extractedPacket = Object.setPrototypeOf(encodedPacket.value, type);
    return extractedPacket;
}

(<any>globalThis).clone = clone;