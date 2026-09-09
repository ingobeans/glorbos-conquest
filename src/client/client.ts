import { MoveCardServerPacket, PlaceCardServerPacket, ServerPacket } from "../server_packets";
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
        } else if (packet instanceof MoveCardServerPacket) {
            let c = this.board.findCardOnBoard(packet.cardEntityId);
            let card = c.placedCard.card;

            if (!c.topOfTile)
                throw Error("Moved Card not top of tile"); // assertion

            card.roundData.hasMoved = (card.roundData.hasMoved || 0) + 1;

            let taken = c.tile.takeLast();
            this.board.getTileAt(packet.newPosition).cards.push(taken);
        } else {
            console.warn("Unhandled packet: ");
            console.warn(packet);
        }
    }
    sendPlayerAction(action: PlayerPacket) {
        this.sendPlayerActionCallback(action);
    }
}