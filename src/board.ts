import { Board } from "./engine";
import { clamp } from "./utils";

export class BoardPosition {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    equals(other: BoardPosition): boolean {
        return this.x == other.x && this.y == other.y
    }
    toIndex(boardSize: number): number {
        return this.x + this.y * boardSize;
    }
    isOutsideBoard(board: Board): boolean {
        return this.x < 0 || this.x >= board.size || this.y < 0 || this.y >= board.size;
    }
    saturatingAdd(v: BoardPositionAddable, board: Board): BoardPosition {
        let n = this.add(v);
        n.x = clamp(n.x, 0, board.size);
        n.y = clamp(n.y, 0, board.size);
        return n;
    }
    add(v: BoardPositionAddable): BoardPosition {
        let x: number;
        let y: number;
        if (v instanceof BoardPosition) {
            x = v.x;
            y = v.y;
        } else {
            x = v[0];
            y = v[1];
        }

        let n = new BoardPosition(this.x + x, this.y + y);
        return n;
    }
}
type BoardPositionAddable = [number, number] | BoardPosition;