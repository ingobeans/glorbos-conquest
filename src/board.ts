import { Board } from "./engine";
import { arrayIndexOf, clamp } from "./utils";

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
    saturatingAdd(v: BoardPositionLike, board: Board): BoardPosition {
        let n = this.add(v);
        n.x = clamp(n.x, 0, board.size);
        n.y = clamp(n.y, 0, board.size);
        return n;
    }
    add(v: BoardPositionLike): BoardPosition {
        let parsed = parseBoardPosititionLike(v);
        let n = new BoardPosition(this.x + parsed.x, this.y + parsed.y);
        return n;
    }
    subtract(v: BoardPositionLike): BoardPosition {
        let parsed = parseBoardPosititionLike(v);
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
    floor(): BoardPosition {
        return new BoardPosition(Math.floor(this.x), Math.floor(this.y));
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
function parseBoardPosititionLike(v: BoardPositionLike): BoardPosition {
    let x: number;
    let y: number;
    if (typeof v == "number") {
        x = v;
        y = v;
    }
    else if (v instanceof BoardPosition) {
        return v;
    } else if ("x" in v) {
        x = v.x;
        y = v.y;
    }
    else {
        x = v[0];
        y = v[1];
    }
    return new BoardPosition(x, y);
}
export type BoardPositionLike = [number, number] | BoardPosition | { x: number, y: number } | number;

export function drawLine(from: BoardPositionLike, angle: number, maxLength: number, includeSelf: boolean = false) {
    let fromParsed = parseBoardPosititionLike(from);
    const stepSize = 0.2;
    let stepX = Math.cos(angle) * stepSize;
    let stepY = Math.sin(angle) * stepSize;
    let pos = fromParsed.add(0.5);
    let tiles: BoardPosition[] = [];
    while (true) {
        let currentTile = pos.floor();
        if (arrayIndexOf(tiles, currentTile) == -1 && (includeSelf || !currentTile.equals(fromParsed))) {
            tiles.push(currentTile);
            if (tiles.length >= maxLength) {

                return tiles;
            }
        }
        pos.x += stepX;
        pos.y += stepY;
    }
}