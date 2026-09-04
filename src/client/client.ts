import { PlaceCardPlayerAction, PlayerAction, ProcessPlayerActionResult } from "../actions";
import { BoardPosition } from "../board";
import { Board, Player } from "../engine";

export class Client {
    board: Board;
    player: Player;
    sendPlayerAction: (action: PlayerAction) => ProcessPlayerActionResult;

    constructor(board: Board, player: Player, sendPlayerAction: (action: PlayerAction) => ProcessPlayerActionResult) {
        this.board = board;
        this.player = player;
        this.sendPlayerAction = sendPlayerAction;
    }
}