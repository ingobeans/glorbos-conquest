import { Card } from "../cards";
import { ElementType } from "../elements";
import { Game } from "../engine";

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
        let item = <Card>deck[i];
        let element = document.createElement("div");
        element.classList.add("held-card");
        element.id = "held-card-" + i.toString();
        element.style.setProperty("--index", i.toString());
        element.onmouseover = mouseHoverCard.bind(null, element);
        element.onmousedown = cardMouseDown.bind(null, element);

        let image = document.createElement("img");
        image.classList.add("card-img");
        image.src = "assets/cards/" + <string>item.image + ".png";
        element.appendChild(image);

        for (let i = 0; i < 5; i++) {
            let image = document.createElement("img");
            image.classList.add("card-heart");
            image.src = "assets/heart.png";
            if (i > 1) {
                image.src = "assets/heart_half.png";
            }
            if (i > 2) {
                image.src = "assets/heart_empty.png";
            }
            element.appendChild(image);
        }

        for (const [index, type] of item.elementTypes.entries()) {
            let image = document.createElement("img");
            image.classList.add("card-type");
            image.src = "assets/elements/" + ElementType[type] + ".png";
            image.style.setProperty("--index", index.toString());
            element.appendChild(image);
        }

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
    (<any>drag.element).style.setProperty("--x", "");
    (<any>drag.element).style.setProperty("--y", "");
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
        (<any>drag.element).style.setProperty("--x", deltaX.toString() + "px");
        (<any>drag.element).style.setProperty("--y", deltaY.toString() + "px");
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

export function loadUi(game: Game) {
    createGridElements(game.board.size);
    createPlayerHandElements(<Card[]>game.players[0]?.deck);
}