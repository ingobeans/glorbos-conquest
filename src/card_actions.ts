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
        game.sendPackets([new MoveCardServerPacket(card.card.entityId, this.target)]);
    }
}

export let cardActionsRegistry = [
    MoveCardAction.prototype
];
console.log(cardActionsRegistry);