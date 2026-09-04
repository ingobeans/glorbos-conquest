export class BoardPosition {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    toIndex(boardSize: number): number {
        return this.x + this.y * boardSize;
    }
}