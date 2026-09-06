import { PlaceCardServerPacket, ServerPacket } from "../server_packets";
import { Board, PlacedCard, Player } from "../engine";
import { PlayerPacket } from "../player_packets";

export class Client {
    board: Board;
    player: Player;
    sendPlayerActionCallback: (action: PlayerPacket) => void;

    constructor(board: Board, player: Player, sendPlayerActionCallback: (action: PlayerPacket) => void) {
        this.board = board;
        this.player = player;
        this.sendPlayerActionCallback = sendPlayerActionCallback;
    }
    receivePacket(packet: ServerPacket) {
        if (packet instanceof PlaceCardServerPacket) {
            console.log(this.player.deck);
            this.board.placeCardAt(new PlacedCard(this.player.takeCard(packet.card.entityId), this.player), packet.position);
        }
    }
    sendPlayerAction(action: PlayerPacket) {
        this.sendPlayerActionCallback(action);
    }
}