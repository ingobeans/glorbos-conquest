import { cardRegistry } from "./cards";
import { Game } from "./engine";

let game = new Game();

let gameGrid = document.getElementById("game-grid");

gameGrid?.style.setProperty("--size", game.board.size.toString());
for (let i = 0; i < game.board.size * game.board.size; i++) {
    let element = document.createElement("div");
    element.classList.add("tile");
    element.id = "tile" + i;
    gameGrid?.append(element);
}

console.log(cardRegistry);