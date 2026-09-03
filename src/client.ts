import { Card, cardRegistry } from "./cards";
import { Game } from "./engine";

let game = new Game(5);

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

function createPlayerHandElements(deck: Card[]) {
    for (let i = 0; i < deck.length; i++) {
        let element = document.createElement("div");
        element.classList.add("held-card");
        element.id = "held-card-" + i.toString();
        element.style.setProperty("--index", i.toString());
        element.onmouseover = mouseHoverCard.bind(null, element);
        element.onmousedown = cardMouseDown.bind(null, element);

        let image = document.createElement("img");
        image.src = "assets/cards/" + <string>deck[i]?.image + ".png";
        element.appendChild(image);

        playerDeck?.append(element);
    }
    playerDeck?.style.setProperty("--count", deck.length.toString());
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
    deckZone: -1,
    element: null,
    active: false,
    cardStartIndex: 0,
};
function cardMouseDown(element: any, event: MouseEvent) {
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.mouseX = event.clientX;
    drag.mouseY = event.clientY;
    drag.element = element;
    drag.active = true;
    element.style.transition = "0s";
    element.classList.add("dragged-card");
    drag.cardStartIndex = parseInt((<any>drag.element).id.replace("held-card-", ""));
    drag.deckZone = drag.cardStartIndex;
};
function getMousePlayerDeckZone(mouseX: number, mouseY: number): number {
    let rect = playerDeck?.getBoundingClientRect();
    let count = playerDeck?.children.length || 1;
    let x = rect?.x || 0;
    let y = rect?.y || 0;
    let w = rect?.width || 0;
    let zoneWidth = w / count;
    if (mouseY < y - 200) {
        return -1;
    }
    if (mouseX >= x && mouseX <= x + w) {
        let index = Math.floor((mouseX - x) / zoneWidth);
        return index;
    }
    return -1;
}

document.addEventListener("mouseup", (event) => {
    if (!drag.active)
        return;
    drag.active = false;
    (<any>drag.element).style.transition = "";
    (<any>drag.element).classList.remove("dragged-card");
    (<any>drag.element).style.transform = ``;
    (<any>drag.element).style.setProperty("--index", drag.deckZone.toString());
    (<any>drag.element).id = "held-card-" + drag.deckZone.toString();
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
    }

    // find if card is being reordered in deck
    let deckZone = getMousePlayerDeckZone(drag.mouseX, drag.mouseY);

    if (deckZone != -1 && deckZone != drag.deckZone) {
        let cardsToMove = [];
        let direction = 0;
        if (deckZone != drag.deckZone) {
            console.log("new zone: " + deckZone);
            direction = (deckZone > drag.deckZone) ? 1 : -1;
            for (let i = drag.deckZone + direction; i != deckZone + direction; i += direction) {
                cardsToMove.push({ element: document.getElementById("held-card-" + i.toString()), index: i });
                console.log("move: " + i);
            }
        }
        drag.deckZone = deckZone;
        for (let item of cardsToMove) {
            item.element?.style.setProperty("--index", (item.index - direction).toString());
            (<any>item.element).id = "held-card-" + (item.index - direction).toString();
        }
        (<any>drag.element).id = "held-card-" + deckZone.toString();
    }
});

createGridElements(game.board.size);
createPlayerHandElements(<Card[]>game.players[0]?.deck);