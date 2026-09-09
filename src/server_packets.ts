import { BoardPosition } from "./board";
import { Card, CardRoundData } from "./cards";

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
];

// used to get the unioned type of server packets
let t = serverPacketRegistry[0];
if (t == undefined) {
    throw Error();
}
export type ServerPacket = typeof t;