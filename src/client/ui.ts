import { MoveCardServerPacket, PlaceCardServerPacket, ServerPacket } from "../server_packets";
import { BoardPosition } from "../board";
import { Card } from "../cards";
import { ElementType } from "../elements";
import { Game, PlacedCard } from "../engine";
import { Client } from "./client";
import { CardActionPlayerPacket, PlaceCardPlayerPacket, PlayerPacket } from "../player_packets";
import { CardAction, TargetedCardAction, TileHighlightColor } from "../card_actions";

let gameGrid = document.getElementById("game-grid");
let playerDeck = document.getElementById("player-deck");
let tilesHighlight = document.getElementById("tiles-highlight");

export let activeClient: Client | undefined = undefined;

function sendPlayerPacket(action: PlayerPacket) {
    if (!activeClient)
        throw Error("No active client");

    activeClient.sendPlayerAction(action);
}

function handleReceivedPacket(packet: ServerPacket) {
    if (!activeClient)
        throw Error("No active client");

    console.log(JSON.stringify(packet));

    if (packet instanceof PlaceCardServerPacket) {
        let element = document.querySelector(`.held-card[entityId='${packet.card.entityId.toString()}']`);
        if (!element)
            throw Error("Card to be placed not found!");

        let tile = document.getElementById("tile" + activeClient.board.positionToIndex(packet.position));
        if (!tile)
            throw Error("Tile not found");

        (<any>element).onmouseover = undefined;
        (<any>element).onmousedown = undefined;
        element.classList.remove("held-card");
        element.classList.add("placed-card");
        tile.appendChild(element);
        let startIndex = parseInt(element.id.replace("held-card-", ""));
        for (let i = startIndex; i <= activeClient.player.deck.length; i++) {
            console.log(i);
            let e = <any>document.getElementById("held-card-" + i.toString());
            e.id = "held-card-" + (i - 1).toString();
            e.style.setProperty("--index", (i - 1).toString());
        }
        element.id = "";
        playerDeck?.style.setProperty("--count", activeClient.player.deck.length.toString());
    } else if (packet instanceof MoveCardServerPacket) {
        let element = document.querySelector(`.placed-card[entityId='${packet.cardEntityId.toString()}']`);
        let newTile = document.getElementById("tile" + activeClient.board.positionToIndex(packet.newPosition));
        if (!element)
            throw Error("Card not found");
        newTile?.appendChild(element);
        clickTile(<HTMLDivElement>newTile);
    }

    else {
        console.warn("Unhandled packet");
    }
}

let highlightColorToHueRotate = {
    [TileHighlightColor.Blue]: 0,
    [TileHighlightColor.Red]: 190,
}

function highlightTiles(tiles: [BoardPosition, TileHighlightColor][]) {
    if (!tilesHighlight?.children)
        throw Error();

    while (tilesHighlight.children[0]) {
        tilesHighlight.children[0].remove();
    }
    for (let tile of tiles) {
        let element = document.createElement("div");
        element.className = "highlight-tile";
        element.style.setProperty("--x", tile[0].x.toString());
        element.style.setProperty("--y", tile[0].y.toString());
        element.style.setProperty("--c", highlightColorToHueRotate[tile[1]].toString() + "deg");
        tilesHighlight.appendChild(element);
    }
}

function createGridElements(size: number) {
    gameGrid?.style.setProperty("--size", size.toString());
    for (let i = 0; i < size * size; i++) {
        let element = document.createElement("div");
        element.classList.add("tile");
        element.id = "tile" + i;
        element.onclick = clickTile.bind(null, element);
        gameGrid?.append(element);
    }
}

let selectedTile = {
    placedCard: <PlacedCard | null>null,
    position: <BoardPosition | null>null,
};
function stopSelectingTile() {
    selectedTile.position = null;
    selectedTile.placedCard = null;
    highlightTiles([]);
}
function clickTile(element: HTMLDivElement | BoardPosition) {
    if (!activeClient)
        return;
    let id;
    let position;

    if (element instanceof HTMLDivElement) {
        id = parseInt(element.id.replace("tile", ""));
        position = activeClient.board.indexToPosition(id);
    } else {
        position = element;
        id = activeClient.board.positionToIndex(position);
    }

    if (selectedTile.placedCard) {
        let pressedAction: CardAction | null = null;
        for (let action of selectedTile.placedCard.card.actions) {
            if (action.available(activeClient.board, selectedTile.placedCard, activeClient.player)) {
                let tiles = action.highlightsTiles(activeClient.board, selectedTile.placedCard, activeClient.player);
                for (let tile of tiles) {
                    if (tile[0].equals(position)) {
                        pressedAction = action;
                    }
                }
            }
        }
        if (pressedAction) {
            let s = selectedTile.placedCard;
            highlightTiles([]);
            stopSelectingTile();
            if (pressedAction instanceof TargetedCardAction) {
                let instance = new (<any>pressedAction).constructor(position);
                sendPlayerPacket(new CardActionPlayerPacket(
                    s.card.entityId,
                    instance
                ));
            }
            return;
        }
    }

    let placedCard = activeClient.board.tiles[id]?.tryBorrowLast();
    if (!placedCard) {
        stopSelectingTile();
        return;
    }
    if (placedCard.ownerIndex != activeClient.player.playerIndex) {
        stopSelectingTile();
        return;
    }
    selectedTile = { placedCard: placedCard, position: position };
    highlightTiles(activeClient.board.getHighlightedTiles(placedCard, activeClient.player));
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
    element: <HTMLDivElement | null>null,
    active: false,
    cardStartIndex: 0,
};
function cardMouseDown(element: HTMLDivElement, event: MouseEvent) {
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.mouseX = event.clientX;
    drag.mouseY = event.clientY;
    drag.element = element;
    drag.active = true;
    element.style.transition = "0s";
    element.classList.add("dragged-card");
    drag.cardStartIndex = parseInt(drag.element.id.replace("held-card-", ""));
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

    drag.element?.classList.remove("dragged-card");

    let pos = getMouseTile(drag.mouseX, drag.mouseY);
    if (pos && activeClient) {
        let id = parseInt(drag.element?.getAttribute("entityId") || "-1");
        let placed = new PlacedCard(activeClient.player.borrowCard(id), activeClient.player);
        if (activeClient.board.canPlaceAt(placed, pos)) {
            sendPlayerPacket(new PlaceCardPlayerPacket(id, pos));
            return;
        }
    }

    (<HTMLDivElement>drag.element).style.transition = "";
    drag.element?.style.setProperty("--x", "");
    drag.element?.style.setProperty("--y", "");
    drag.element?.style.setProperty("--index", drag.deckZone.toString());
});
document.addEventListener("mousemove", (event) => {
    if (!drag.active)
        return;
    drag.mouseX = event.clientX;
    drag.mouseY = event.clientY;
    let deltaX = drag.mouseX - drag.startX;
    let deltaY = drag.mouseY - drag.startY;
    if (!drag.element)
        return;

    drag.element.style.setProperty("--x", deltaX.toString() + "px");
    drag.element.style.setProperty("--y", deltaY.toString() + "px");

    // find if card is being reordered in deck
    let deckZone = getMousePlayerDeckZone(drag.mouseX, drag.mouseY);

    if (deckZone != -1 && deckZone != drag.deckZone) {
        let cardsToMove = [];
        let direction = 0;
        if (deckZone != drag.deckZone) {
            direction = (deckZone > drag.deckZone) ? 1 : -1;
            for (let i = drag.deckZone + direction; i != deckZone + direction; i += direction) {
                let e = document.getElementById("held-card-" + i.toString());
                if (!e) {
                    console.error("held-card-i" + i.toString() + " not found");
                    continue;
                }
                cardsToMove.push({ element: e, index: i });
            }
        }
        drag.deckZone = deckZone;
        for (let item of cardsToMove) {
            item.element.style.setProperty("--index", (item.index - direction).toString());
            item.element.id = "held-card-" + (item.index - direction).toString();
        }
        drag.element.id = "held-card-" + deckZone.toString();
    }
});

export function loadUi(client: Client): (packet: ServerPacket) => void {
    activeClient = client;
    createGridElements(client.board.size);
    createPlayerHandElements(client.player.deck);
    return handleReceivedPacket;
}