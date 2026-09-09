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
        let parsed = parseBoardPosititionAddable(v);
        let n = new BoardPosition(this.x + parsed.x, this.y + parsed.y);
        return n;
    }
    subtract(v: BoardPositionAddable): BoardPosition {
        let parsed = parseBoardPosititionAddable(v);
        let n = new BoardPosition(this.x - parsed.x, this.y - parsed.y);
        return n;
    }
    /** Returns zero if length is zero */
    normalize(): BoardPosition {
        let length = this.length();
        if (length == 0.0) {
            return new BoardPosition(0.0, 0.0);
        }
        return new BoardPosition(this.x / length, this.y / length);
    }
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    lengthSum(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }
    abs(): BoardPosition {
        return new BoardPosition(Math.abs(this.x), Math.abs(this.y));
    }
}
function parseBoardPosititionAddable(v: BoardPositionAddable): { x: number, y: number } {
    let x: number;
    let y: number;
    if (v instanceof BoardPosition) {
        x = v.x;
        y = v.y;
    } else if ("x" in v) {
        return v;
    }
    else {
        x = v[0];
        y = v[1];
    }
    return { x: x, y: y };
}
type BoardPositionAddable = [number, number] | BoardPosition | { x: number, y: number };