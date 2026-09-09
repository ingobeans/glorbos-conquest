import { BoardPosition } from "./board";
import { Board, Game, PlacedCard, Player, Tile } from "./engine";
import { MoveCardServerPacket } from "./server_packets";

export enum TileHighlightColor {
    Blue,
    Red,
}

export enum CardActionResource {
    Movement,
    Attack,
}

export class CardAction {
    name: string = "unknown";
    icon: string = "placeholder";
    desc: string = "unknown";
    usesResources: CardActionResource[] = [];

    /** Server- and clientside. */
    available(board: Board, card: PlacedCard, player: Player): boolean {
        return this.isResourcesAvailable(board, card, player) && this.availableCustom(board, card, player);
    }

    /** Server- and clientside. */
    isResourcesAvailable(board: Board, card: PlacedCard, player: Player): boolean {
        console.log(this.name);
        console.log(this.desc);
        console.log(this.usesResources);
        console.log(this);
        for (let resource of this.usesResources) {
            if (card.card.roundData.resources[resource] <= 0) {
                return false;
            }
        }
        return true;
    }

    /** Server- and clientside. */
    availableCustom(board: Board, card: PlacedCard, player: Player): boolean {
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

    useResources(game: Game, tile: Tile, card: PlacedCard, player: Player) {
        for (let resource of this.usesResources) {
            card.card.roundData.resources[resource]--;
        }
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
    usesResources = [CardActionResource.Movement];
    availableCustom(board: Board, card: PlacedCard, player: Player): boolean {
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