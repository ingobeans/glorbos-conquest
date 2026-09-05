import { PlaceCardPlayerAction, PlaceCardServerAction, PlayerAction, ProcessPlayerActionResult } from "../actions";
import { BoardPosition } from "../board";
import { Board, PlacedCard, Player } from "../engine";
import { clone } from "../utils";

export class Client {
    board: Board;
    player: Player;
    sendPlayerActionCallback: (action: PlayerAction) => ProcessPlayerActionResult;

    constructor(board: Board, player: Player, sendPlayerActionCallback: (action: PlayerAction) => ProcessPlayerActionResult) {
        this.board = board;
        this.player = player;
        this.sendPlayerActionCallback = sendPlayerActionCallback;
    }
    sendPlayerAction(action: PlayerAction): ProcessPlayerActionResult {
        let result = this.sendPlayerActionCallback(action);
        if (result instanceof PlaceCardServerAction) {
            this.board.placeCardAt(new PlacedCard(this.player.takeCard(result.card.entityId), this.player), result.position);
        }
        return result;
    }
}