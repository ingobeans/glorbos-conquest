import { BoardPosition } from "./board";
import { Card, CardRoundData } from "./cards";
import { Particle, particlesRegistry } from "./particles";
import { encodePacket } from "./utils";

export class ErrorServerPacket {
    text: string;
    constructor(text: string) {
        this.text = text;
    }
}

export class PlaceCardServerPacket {
    card: Card;
    position: BoardPosition;
    constructor(card: Card, position: BoardPosition) {
        this.card = card;
        this.position = position;
    }
}

export class UpdateCardRoundDataServerPacket {
    cardEntityId: number;
    roundData: CardRoundData;
    constructor(cardEntityId: number, resources: CardRoundData) {
        this.cardEntityId = cardEntityId;
        this.roundData = resources;
    }
}

export class MoveCardServerPacket {
    cardEntityId: number;
    newPosition: BoardPosition;
    constructor(cardEntityId: number, newPosition: BoardPosition) {
        this.cardEntityId = cardEntityId;
        this.newPosition = newPosition;
    }
}

export class DamageServerPacket {
    attackerEntityId: number;
    victimEntityId: number;
    amount: number;
    constructor(attackerEntityId: number, victimEntityId: number, amount: number) {
        this.attackerEntityId = attackerEntityId;
        this.victimEntityId = victimEntityId;
        this.amount = amount;
    }
}

export class ShowParticleServerPacket {
    payload: string;
    constructor(particle: Particle | string) {
        let encoded: string;
        if (particle instanceof Particle) {
            encoded = encodePacket(particle, particlesRegistry);
        } else {
            encoded = particle;
        }
        this.payload = encoded;
    }
}

/** List of all serverPackets. 
 * Every packet class must be listed here to be valid.
 * 
 * When it comes to inheritance, parent classes should be further up,
 * and child classes should be further down. If B inherits from A, 
 * then A should be listed earlier than B.
*/
export let serverPacketRegistry = [
    ErrorServerPacket.prototype,
    PlaceCardServerPacket.prototype,
    MoveCardServerPacket.prototype,
    UpdateCardRoundDataServerPacket.prototype,
    DamageServerPacket.prototype,
    ShowParticleServerPacket.prototype,
];

// used to get the unioned type of server packets
let t = serverPacketRegistry[0];
if (t == undefined) {
    throw Error();
}
export type ServerPacket = typeof t;