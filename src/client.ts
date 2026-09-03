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
        element.onmouseover = mouseHoverCard.bind(null, element);
        element.onmousedown = cardMouseDown.bind(null, element);
        playerDeck?.append(element);
    }
    playerDeck?.style.setProperty("--count", count.toString());
}

let zIndex = 0;
function mouseHoverCard(element: any) {
    zIndex++;
    element.style.zIndex = zIndex;
};

let drag = {
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    element: null,
    active: false,
};
function cardMouseDown(element: any, event: MouseEvent) {
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.element = element;
    drag.active = true;
    element.style.transition = "0s";
    element.classList.add("dragged-card");
};

document.addEventListener("mouseup", (event) => {
    drag.active = false;
    (<any>drag.element).style.transition = "";
    (<any>drag.element).classList.remove("dragged-card");
    (<any>drag.element).style.transform = ``;
});
document.addEventListener("mousemove", (event) => {
    if (!drag.active)
        return;
    drag.mouseX = event.clientX;
    drag.mouseY = event.clientY;
    let deltaX = drag.mouseX - drag.startX;
    let deltaY = drag.mouseY - drag.startY;
    if (drag.element) {
        deltaX /= 1.4;
        deltaY /= 1.4;
        deltaY -= 40;
        (<any>drag.element).style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        // (<any>drag.element).style.left = `${deltaX}px`;
        // (<any>drag.element).style.top = `${deltaY}px`;
    }
});

createGridElements(game.board.size);
createPlayerHandElements(5);