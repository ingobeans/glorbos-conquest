import { BoardPosition } from "./board";
import { Board, Game, PlacedCard, Player } from "./engine";

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
    highlightsTiles(board: Board, card: PlacedCard, player: Player): [BoardPosition, string][] {
        return [];
    }

    /** Runs serverside when the action is used. To show effects for players, send them ServerActions */
    use(game: Game, card: PlacedCard, player: Player) { }
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
    highlightsTiles(board: Board, card: PlacedCard, player: Player): [BoardPosition, string][] {
        let tiles: [BoardPosition, string][] = [];
        let directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
        let position = board.positionOf(card);
        for (let direction of directions) {
            let newPos = position.add(direction);
            if (newPos.isOutsideBoard(board)) {
                continue;
            }
            tiles.push([newPos, "#fff"]);
        }

        return tiles;
    }
}

export let cardActionsRegistry = [
    MoveCardAction.prototype
];