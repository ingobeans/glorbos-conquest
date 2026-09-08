import { BoardPosition } from "./board";
import { CardAction, cardActionsRegistry } from "./card_actions";
import { createEncodedPacket, EncodedPacket } from "./utils";

export enum StatePlayerPacketType {
    EndTurn,
}
export class StatePlayerPacket {
    type: StatePlayerPacketType;
    constructor(type: StatePlayerPacketType) {
        this.type = type;
    }
}

export class PlaceCardPlayerPacket {
    cardEntityId: number;
    position: BoardPosition;
    constructor(cardEntityId: number, position: BoardPosition) {
        this.cardEntityId = cardEntityId;
        this.position = position;
    }
}
export class CardActionPlayerPacket<Type extends CardAction> {
    cardEntityId: number;
    cardActionPacket: EncodedPacket<Type>;
    constructor(cardEntityId: number, cardAction: Type) {
        this.cardEntityId = cardEntityId;
        this.cardActionPacket = createEncodedPacket(cardAction, cardActionsRegistry);
    }
}

export let playerPacketsRegistry = [
    StatePlayerPacket.prototype,
    PlaceCardPlayerPacket.prototype,
    CardActionPlayerPacket.prototype
];

// used to get the unioned type of player packets
let t = playerPacketsRegistry[0];
if (t == undefined) {
    throw Error();
}
export type PlayerPacket = typeof t;