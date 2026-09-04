import { BoardPosition } from "./board";
import { Card } from "./cards";

export class ProcessPlayerActionError {
    text: string;
    constructor(text: string) {
        this.text = text;
    }
}

export class PlaceCardServerAction {
    card: Card;
    position: BoardPosition;
    constructor(card: Card, position: BoardPosition) {
        this.card = card;
        this.position = position;
    }
}

export type ProcessPlayerActionResult = ProcessPlayerActionError | PlaceCardServerAction;


export enum StatePlayerActionType {
    EndTurn,
}
export class StatePlayerAction {
    type: StatePlayerActionType;
    constructor(type: StatePlayerActionType) {
        this.type = type;
    }
}

export class PlaceCardPlayerAction {
    cardEntityId: number;
    position: BoardPosition;
    constructor(cardEntityId: number, position: BoardPosition) {
        this.cardEntityId = cardEntityId;
        this.position = position;
    }
}

export type PlayerAction = StatePlayerAction | PlaceCardPlayerAction;