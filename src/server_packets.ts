import { BoardPosition } from "./board";
import { Card } from "./cards";

// This file contains definitons for all types of client/server actions (packets).
//
// ServerActions are packets sent from the server to clients.
// PlayerActions are packets sent from a client to the server. These also include CardActions. The type is declared in `actions.ts`

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


export let serverPacketRegistry = [
    ErrorServerPacket.prototype,
    PlaceCardServerPacket.prototype,
];

// used to get the unioned type of player packets
let t = serverPacketRegistry[0];
if (t == undefined) {
    throw Error();
}
export type ServerPacket = typeof t;