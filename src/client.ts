import { cardRegistry } from "./cards";
import { Game } from "./engine";

let game = new Game();

console.log(cardRegistry);

let gameGrid = document.getElementById("game-grid");
let playerDeck = document.getElementById("player-deck");

function createGridElements(size: number) {
    gameGrid?.style.setProperty("--size", size.toString());
    for (let i = 0; i < size * size; i++) {
        let element = document.createElement("div");
        element.classList.add("tile");
        element.id = "tile" + i;
        gameGrid?.append(element);
    }
}

function createPlayerHandElements(count: number) {
    for (let i = 0; i < count; i++) {
        let element = document.createElement("div");
        element.classList.add("held-card");
        element.style.setProperty("--index", i.toString());
        element.onmouseover = mouseCard.bind(null, element);
        playerDeck?.append(element);
    }
    playerDeck?.style.setProperty("--count", count.toString());
}

let zIndex = 0;
function mouseCard(element: any) {
    zIndex++;
    element.style.zIndex = zIndex;
};

createGridElements(game.board.size);
createPlayerHandElements(5);