import { BoardPosition } from "./board";
import { Board, Game, PlacedCard, Player, Tile } from "./engine";
import { MoveCardServerPacket } from "./server_packets";

export enum TileHighlightColor {
    Blue,
    Red,
}

export class CardAction {
    name: string = "unknown";
    icon: string = "placeholder";
    desc: string = "unknown";

    /** Runs server- and clientside. */
    available(board: Board, card: PlacedCard, player: Player): boolean {
        return true;
    }

    /** 
     * Runs clientside for the frontend. 
     * Should return tiles that should be highlighted when this action is previewed.
     * Returns a list of tile indexes with the color for the highlight in hex.
    */
    highlightsTiles(board: Board, card: PlacedCard, player: Player): [BoardPosition, TileHighlightColor][] {
        return [];
    }

    /** Runs serverside when the action is used. To show effects for players, send them ServerActions */
    use(game: Game, tile: Tile, card: PlacedCard, player: Player) { }
}

export class TargetedCardAction extends CardAction {
    target: BoardPosition;
    constructor(target: BoardPosition) {
        super();
        this.target = target;
    }
}

export class MoveCardAction extends TargetedCardAction {
    name = "Move";
    available(board: Board, card: PlacedCard, player: Player): boolean {
        if (card.card.roundData.hasMoved)
            return false;
        let highlightedTiles = this.highlightsTiles(board, card, player);
        if (highlightedTiles.length == 0)
            return false;

        return true;
    }
    highlightsTiles(board: Board, card: PlacedCard, player: Player): [BoardPosition, TileHighlightColor][] {
        let tiles: [BoardPosition, TileHighlightColor][] = [];
        let directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
        let position = board.positionOf(card);
        for (let direction of directions) {
            let newPos = position.add(direction);
            if (newPos.isOutsideBoard(board)) {
                continue;
            }
            if (!board.canPlaceAt(card, newPos)) {
                continue;
            }
            tiles.push([newPos, TileHighlightColor.Blue]);
        }

        return tiles;
    }
    use(game: Game, tile: Tile, card: PlacedCard, player: Player): void {
        let taken = tile.takeLast();
        let targetTile = game.board.getTileAt(this.target);
        targetTile.cards.push(taken);
        card.card.roundData.hasMoved = (card.card.roundData.hasMoved || 0) + 1;
        game.sendPackets([new MoveCardServerPacket(card.card.entityId, this.target)]);
    }
}


/** List of all cardActions. 
 * Every card action class must be listed here to be valid.
 * 
 * When it comes to inheritance, parent classes should be further up,
 * and child classes should be further down. If B inherits from A, 
 * then A should be listed earlier than B.
*/
export let cardActionsRegistry = [
    MoveCardAction.prototype
];
console.log(cardActionsRegistry);