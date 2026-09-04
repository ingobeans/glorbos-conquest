import { BoardPosition } from "./board";

export class ProcessPlayerActionError {
    text: string;
    constructor(text: string) {
        this.text = text;
    }
}

export type ProcessPlayerActionResult = ProcessPlayerActionError;


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