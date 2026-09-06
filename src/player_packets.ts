import { BoardPosition } from "./board";
import { cardActionsRegistry } from "./card_actions";

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
export class CardActionPlayerPacket<Type extends Object> {
    cardEntityId: number;
    cardActionIndex: number;
    cardActionData: Type;
    constructor(cardEntityId: number, cardActionIndex: number, cardActionData: Type) {
        this.cardEntityId = cardEntityId;
        this.cardActionIndex = cardActionIndex;
        this.cardActionData = cardActionData;
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