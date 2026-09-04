import { PlaceCardPlayerAction, PlaceCardServerAction, PlayerAction } from "../actions";
import { BoardPosition } from "../board";
import { Card } from "../cards";
import { ElementType } from "../elements";
import { Game } from "../engine";
import { Client } from "./client";

let gameGrid = document.getElementById("game-grid");
let playerDeck = document.getElementById("player-deck");

export let activeClient: Client | undefined = undefined;

function sendPlayerAction(action: PlayerAction) {
    if (!activeClient)
        throw Error("No active client");

    let result = activeClient.sendPlayerAction(action);
    console.log(JSON.stringify(result));

    if (result instanceof PlaceCardServerAction) {
        let element = document.querySelector(`.held-card[entityId='${result.card.entityId.toString()}']`);
        if (!element)
            throw Error("Card to be placed not found!");

        let tile = document.getElementById("tile" + result.position.toIndex(activeClient.board.size));
        if (!tile)
            throw Error("Tile not found");

        (<any>element).onmouseover = undefined;
        (<any>element).onmousedown = undefined;
        element.classList.remove("held-card");
        element.classList.add("placed-card");
        tile.appendChild(element);
        let startIndex = parseInt(element.id.replace("held-card-", ""));
        for (let i = startIndex; i <= activeClient.player.deck.length; i++) {
            let e = <any>document.getElementById("held-card-" + i.toString());
            e.id = "held-card-" + (i - 1).toString();
            e.style.setProperty("--index", (i - 1).toString());
        }
        element.id = "";
        playerDeck?.style.setProperty("--count", activeClient.player.deck.length.toString());
    }
}

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
        element.setAttribute("entityId", item.entityId.toString());
        element.classList.add("held-card");
        element.classList.add("card");
        element.id = "held-card-" + i.toString();
        element.style.setProperty("--index", i.toString());
        element.onmouseover = mouseHoverCard.bind(null, element);
        element.onmousedown = cardMouseDown.bind(null, element);

        let image = document.createElement("img");
        image.classList.add("card-img");
        image.src = "assets/cards/" + <string>item.image + ".png";
        element.appendChild(image);

        for (let i = 0; i < item.maxHealth / 2; i++) {
            console.log(i);
            console.log(item.maxHealth / 2);
            console.log("item.maxHealth^");
            let image = document.createElement("img");
            image.classList.add("card-heart");
            image.src = "assets/graphics/heart.png";
            if (i != item.maxHealth / 2 && i == Math.floor(item.maxHealth / 2)) {
                image.src = "assets/graphics/heart_half_full.png";
            }
            element.appendChild(image);
        }

        for (const [index, type] of item.elementTypes.entries()) {
            let image = document.createElement("img");
            image.classList.add("card-type");
            image.src = "assets/elements/" + ElementType[type].toLowerCase() + ".png";
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
    element: <Element | null>null,
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

function getMouseTile(mouseX: number, mouseY: number): BoardPosition | null {
    let rect = gameGrid?.getBoundingClientRect();
    let boardSize = activeClient?.board.size || 0;
    let x = rect?.x || 0;
    let y = rect?.y || 0;
    let w = rect?.width || 0;
    let h = rect?.width || 0;
    let tileSize = w / boardSize;
    if (mouseX >= x && mouseX < x + w && mouseY >= y && mouseY < y + h) {
        let boardX = Math.floor((mouseX - x) / tileSize);
        let boardY = Math.floor((mouseY - y) / tileSize);
        return new BoardPosition(boardX, boardY);
    }
    return null;
}
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
    if (mouseX >= x && mouseX < x + w) {
        let index = Math.floor((mouseX - x) / zoneWidth);
        return index;
    }
    return -1;
}

document.addEventListener("mouseup", (_) => {
    if (!drag.active)
        return;
    drag.active = false;
    (<any>drag.element).style.transition = "";
    (<any>drag.element).classList.remove("dragged-card");
    (<any>drag.element).style.setProperty("--x", "");
    (<any>drag.element).style.setProperty("--y", "");
    (<any>drag.element).style.setProperty("--index", drag.deckZone.toString());
    (<any>drag.element).id = "held-card-" + drag.deckZone.toString();


    let pos = getMouseTile(drag.mouseX, drag.mouseY);
    if (pos) {
        if (activeClient) {
            let id = parseInt(drag.element?.getAttribute("entityId") || "-1");
            sendPlayerAction(new PlaceCardPlayerAction(id, pos));
        }
    }
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

export function loadUi(client: Client) {
    activeClient = client;
    createGridElements(client.board.size);
    createPlayerHandElements(client.player.deck);
}