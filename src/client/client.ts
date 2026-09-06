import { PlaceCardServerPacket, ServerPacket } from "../server_packets";
import { Board, PlacedCard, Player } from "../engine";
import { PlayerPacket } from "../player_packets";

export class Client {
    board: Board;
    player: Player;
    sendPlayerActionCallback: (action: PlayerPacket) => ServerPacket;

    constructor(board: Board, player: Player, sendPlayerActionCallback: (action: PlayerPacket) => ServerPacket) {
        this.board = board;
        this.player = player;
        this.sendPlayerActionCallback = sendPlayerActionCallback;
    }
    sendPlayerAction(action: PlayerPacket): ServerPacket {
        let result = this.sendPlayerActionCallback(action);
        if (result instanceof PlaceCardServerPacket) {
            this.board.placeCardAt(new PlacedCard(this.player.takeCard(result.card.entityId), this.player), result.position);
        }
        return result;
    }
}