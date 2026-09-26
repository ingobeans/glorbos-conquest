import { DamageServerPacket, MoveCardServerPacket, PlaceCardServerPacket, ServerPacket, UpdateCardRoundDataServerPacket } from "../server_packets";
import { BoardPosition } from "../board";
import { Card } from "../cards";
import { ElementType } from "../elements";
import { Board, Game, PlacedCard } from "../engine";
import { Client } from "./client";
import { CardActionPlayerPacket, PlaceCardPlayerPacket, PlayerPacket } from "../player_packets";
import { BeamAttackCardAction, CardAction, TargetedCardAction, TileHighlightColor } from "../card_actions";
import { addHearts } from "../header_row_items";

let gameGrid = document.getElementById("game-grid");
let playerDeck = document.getElementById("player-deck");
let tilesHighlight = document.getElementById("tiles-highlight");
let placedCardsContainer = document.getElementById("placed-cards");
let cardInfo = <HTMLDivElement>document.getElementById("card-info");
let cardInfoTitle = <HTMLElement>document.getElementById("card-info-title");
let cardInfoHearts = <HTMLElement>document.getElementById("card-info-hearts");
let cardInfoActions = <HTMLElement>document.getElementById("card-info-actions");
let beamAttackOrigin = <HTMLElement>document.getElementById("beam-attack-origin");

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
        let element = <HTMLDivElement | null>document.querySelector(`.held-card[entityId='${packet.card.entityId.toString()}']`);
        if (!element)
            throw Error("Card to be placed not found!");



        element.onmouseover = null;
        element.onmousedown = null;
        element.classList.remove("held-card");
        element.classList.add("placed-card");
        placedCardsContainer?.appendChild(element);
        let startIndex = parseInt(element.id.replace("held-card-", ""));
        for (let i = startIndex; i <= activeClient.player.deck.length; i++) {
            console.log(i);
            let e = <any>document.getElementById("held-card-" + i.toString());
            e.id = "held-card-" + (i - 1).toString();
            e.style.setProperty("--index", (i - 1).toString());
        }
        element.id = "";
        element.style = "";
        element.style.setProperty("--x", packet.position.x.toString());
        element.style.setProperty("--y", packet.position.y.toString());
        playerDeck?.style.setProperty("--count", activeClient.player.deck.length.toString());
        updateAvailableCards();

        clickTile(packet.position);
    } else if (packet instanceof MoveCardServerPacket) {
        let element = <HTMLDivElement | null>document.querySelector(`.placed-card[entityId='${packet.cardEntityId.toString()}']`);
        if (!element)
            throw Error("Card not found");

        element.style.setProperty("--x", packet.newPosition.x.toString());
        element.style.setProperty("--y", packet.newPosition.y.toString());
        let newTile = document.getElementById("tile" + activeClient.board.positionToIndex(packet.newPosition));
        clickTile(<HTMLDivElement>newTile);
        updateAvailableCards();
    }
    else if (packet instanceof UpdateCardRoundDataServerPacket) {
        updateAvailableCards();
        if (selectedTile.position) {
            clickTile(selectedTile.position);
        }
    }
    else if (packet instanceof DamageServerPacket) {
        updateHearts(packet.victimEntityId);
        let element = <HTMLDivElement | null>document.querySelector(`.placed-card[entityId='${packet.attackerEntityId.toString()}']`);
        if (!element)
            throw Error("Card not found");
        let attacker = activeClient.board.findCardOnBoard(packet.attackerEntityId).position;
        let victim = activeClient.board.findCardOnBoard(packet.victimEntityId).position;
        let delta = victim.subtract(attacker).normalize();
        element.style.setProperty("--offset-x", (delta.x * 30).toString() + "px");
        element.style.setProperty("--offset-y", (delta.y * 30).toString() + "px");
        element.style.setProperty("transition", "0.1s");
        setTimeout(() => {
            element.style.setProperty("--offset-x", null);
            element.style.setProperty("--offset-y", null);
            element.style.setProperty("transition", null);
        }, 120)
    }
    else {
        console.warn("Unhandled packet");
    }
}

function hideSelectedActionUI() {
    highlightTiles([]);
    beamAttackOrigin.style.display = "none";
}

function updateBeamAttackAngle(): number {
    let rect = beamAttackOrigin.getBoundingClientRect();
    let deltaX = mouseX - rect.x;
    let deltaY = mouseY - rect.y;
    let angle = Math.atan2(deltaY, deltaX);
    beamAttackOrigin.style.rotate = (angle - Math.PI / 2.0) + "rad";
    return angle;
}

function showSelectedActionUI(action: CardAction, card: PlacedCard) {
    if (!activeClient)
        return;
    hideSelectedActionUI();

    if (action instanceof TargetedCardAction) {
        highlightTiles(action.highlightsTiles(activeClient.board, card, activeClient.player));
    } else if (action instanceof BeamAttackCardAction) {
        let element = <HTMLDivElement>document.querySelector(`.placed-card[entityId='${card.card.entityId.toString()}']`);
        beamAttackOrigin.style.setProperty("--x", element.style.getPropertyValue("--x"));
        beamAttackOrigin.style.setProperty("--y", element.style.getPropertyValue("--y"));
        beamAttackOrigin.style.setProperty("--length", action.range.toString());
        beamAttackOrigin.style.display = "";
        updateBeamAttackAngle();
    }
}

function clickCardInfoAction(element: HTMLDivElement, index: number) {
    if (!selectedTile.position)
        return;
    if (selectedTile.selectedCardAction != null) {
        let parent = element.parentElement;
        let previous = parent?.children[selectedTile.selectedCardAction];
        previous?.classList.remove("card-info-action-container-selected");
    }
    element.classList.add("card-info-action-container-selected");
    selectedTile.selectedCardAction = index;

    let card = <PlacedCard>selectedTile.placedCard;
    let actionInstance = new (<any>card.card.actions[index]).constructor();
    showSelectedActionUI(actionInstance, card)
}

function displayCardInfo(card: PlacedCard | number | undefined) {
    if (card == undefined) {
        cardInfo.style.display = "none";
        return;
    }
    if (!activeClient)
        return;
    if (typeof card == "number") {
        card = activeClient.board.findCardOnBoard(card).placedCard;
    }
    cardInfoTitle.innerText = card.card.name.toUpperCase();

    cardInfoHearts.innerHTML = "";
    addHearts(cardInfoHearts, card.card);

    cardInfoActions.innerHTML = "";
    for (let [index, action] of card.card.actions.entries()) {
        let actionInstance = new (<any>action).constructor();
        let container = document.createElement("div");
        container.classList.add("card-info-action-container");

        let headerRow = document.createElement("div");
        headerRow.classList.add("card-info-action-header-row");

        let unavailable = card.ownerIndex != activeClient.player.playerIndex || !actionInstance.available(activeClient.board, card, activeClient.player);
        if (unavailable) {
            container.classList.add("card-info-action-container-unavailable");
        } else {
            container.onclick = clickCardInfoAction.bind(null, container, index);
            if (index == selectedTile.selectedCardAction) {
                container.classList.add("card-info-action-container-selected");
            }
        }

        let name = document.createElement("span");
        name.innerText = actionInstance.name;
        name.classList.add("card-info-action-name");
        headerRow.appendChild(name);

        for (let item of actionInstance.getHeaderRowItems()) {
            headerRow.appendChild(item.generateElement(card));
        }

        let desc = document.createElement("span");
        desc.innerText = actionInstance.desc;
        name.classList.add("card-info-action-desc");

        container.appendChild(headerRow);
        container.appendChild(desc);
        cardInfoActions.appendChild(container);
    }

    cardInfo.style.display = "";
}

let highlightColorToHueRotate = {
    [TileHighlightColor.Blue]: 0,
    [TileHighlightColor.Red]: 190,
}

function removeChildren(element: HTMLElement) {
    while (element.children[0]) {
        element.children[0].remove();
    }
}

function highlightTiles(tiles: [BoardPosition, TileHighlightColor][]) {
    if (!tilesHighlight?.children)
        throw Error();

    removeChildren(tilesHighlight);
    for (let tile of tiles) {
        let element = document.createElement("div");
        element.className = "highlight-tile";
        element.style.setProperty("--x", tile[0].x.toString());
        element.style.setProperty("--y", tile[0].y.toString());
        element.style.setProperty("--c", highlightColorToHueRotate[tile[1]].toString() + "deg");
        tilesHighlight.appendChild(element);
    }
}

function updateAvailableCards() {
    if (!activeClient)
        return

    for (let tile of activeClient.board.tiles) {
        let placedCard = tile.tryBorrowLast();
        if (!placedCard)
            continue
        let element = document.querySelector(`.placed-card[entityId='${placedCard.card.entityId.toString()}']`);
        if (placedCard.ownerIndex == activeClient.player.playerIndex && !activeClient.board.anyActionAvailable(placedCard, activeClient.player)) {
            element?.classList.add("card-unavailable");
        } else {
            element?.classList.remove("card-unavailable");
        }
    }
}

function createGridElements(board: Board) {
    gameGrid?.style.setProperty("--size", board.size.toString());
    for (let [i, tile] of board.tiles.entries()) {
        let element = document.createElement("div");
        element.classList.add("tile");
        element.id = "tile" + i;
        element.onclick = clickTile.bind(null, element);
        for (let card of tile.cards) {
            let cardElement = createCardElement(card.card);
            cardElement.classList.add("placed-card");
            if (activeClient) {
                if (activeClient.player.playerIndex != card.ownerIndex) {
                    cardElement.classList.add("enemy-card");
                }
                let position = board.indexToPosition(i);
                cardElement.style.setProperty("--x", position.x.toString());
                cardElement.style.setProperty("--y", position.y.toString());
            }
            placedCardsContainer?.appendChild(cardElement);
        }

        gameGrid?.append(element);
    }
}

let selectedTile = {
    placedCard: <PlacedCard | null>null,
    position: <BoardPosition | null>null,
    selectedCardAction: <number | null>null,
};
function stopSelectingTile() {
    let cardElement = document.querySelector(`.placed-card[entityId='${selectedTile.placedCard?.card.entityId.toString()}']`);
    if (cardElement) {
        cardElement.classList.remove("selected-placed-card");
    }
    selectedTile.position = null;
    selectedTile.placedCard = null;
    hideSelectedActionUI();
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
        if (selectedTile.selectedCardAction != null) {
            let action = selectedTile.placedCard.card.actions[selectedTile.selectedCardAction];
            if (action) {
                let actionInstance = <CardAction>(new (<any>action).constructor());
                if (actionInstance.available(activeClient.board, selectedTile.placedCard, activeClient.player)) {
                    let tiles = action.highlightsTiles(activeClient.board, selectedTile.placedCard, activeClient.player);
                    for (let tile of tiles) {
                        if (tile[0].equals(position)) {
                            pressedAction = action;
                        }
                    }
                }
            }
        }
        if (pressedAction) {
            if (pressedAction instanceof TargetedCardAction) {
                let instance = new (<any>pressedAction).constructor(position);
                selectedTile.selectedCardAction = null;
                sendPlayerPacket(new CardActionPlayerPacket(
                    selectedTile.placedCard.card.entityId,
                    instance
                ));
            }
            let placedCard = activeClient.board.findCardOnBoard(selectedTile.placedCard).placedCard;
            displayCardInfo(placedCard);
            return;
        }
    }

    let placedCard = activeClient.board.tiles[id]?.tryBorrowLast();

    let same = (selectedTile.position != null && (position.x == selectedTile.position.x && position.y == selectedTile.position.y));
    let oldActionIndex = selectedTile.selectedCardAction;

    let newSelectedCardAction = 0;

    if (!same) {
        selectedTile.selectedCardAction = newSelectedCardAction;
        displayCardInfo(placedCard);
    }

    stopSelectingTile();
    if (!placedCard) {
        return;
    }
    if (placedCard.ownerIndex != activeClient.player.playerIndex) {
        return;
    }
    selectedTile = { placedCard: placedCard, position: position, selectedCardAction: newSelectedCardAction };
    if (same) {
        selectedTile.selectedCardAction = oldActionIndex;
        console.log("same");
    }

    if (selectedTile.selectedCardAction != null) {
        let action = <CardAction>placedCard.card.actions[selectedTile.selectedCardAction];
        let actionInstance = <CardAction>(new (<any>action).constructor());
        if (actionInstance.available(activeClient.board, placedCard, activeClient.player)) {
            highlightTiles(action.highlightsTiles(activeClient.board, placedCard, activeClient.player))
        }
    }

    let cardElement = document.querySelector(`.placed-card[entityId='${placedCard?.card.entityId.toString()}']`);
    if (cardElement) {
        cardElement.classList.add("selected-placed-card");
    }
}

function updateHearts(cardEntityId: number) {
    if (!activeClient)
        return;
    let element = document.querySelector(`.placed-card[entityId='${cardEntityId.toString()}']`);
    let container = <HTMLElement>element?.getElementsByClassName("hearts-container")[0];

    removeChildren(container);
    addHearts(container, activeClient.board.findCardOnBoard(cardEntityId).placedCard.card);
}

function createCardElement(card: Card): HTMLDivElement {
    let element = document.createElement("div");
    element.setAttribute("entityId", card.entityId.toString());
    element.classList.add("card");

    let image = document.createElement("img");
    image.classList.add("card-img");
    image.src = "assets/cards/" + <string>card.image + ".png";
    element.appendChild(image);

    let heartsContainer = document.createElement("div");
    heartsContainer.className = "hearts-container";
    addHearts(heartsContainer, card);
    element.appendChild(heartsContainer);

    for (const [index, type] of card.elementTypes.entries()) {
        let image = document.createElement("img");
        image.classList.add("card-type");
        image.src = "assets/elements/" + ElementType[type].toLowerCase() + ".png";
        image.style.setProperty("--index", index.toString());
        element.appendChild(image);
    }
    return element
}

function createPlayerHandElements(deck: Card[]) {
    for (let i = 0; i < deck.length; i++) {
        let item = <Card>deck[i];
        let element = createCardElement(item);
        element.id = "held-card-" + i.toString();
        element.style.setProperty("--index", i.toString());
        element.classList.add("held-card");
        element.onmouseover = mouseHoverCard.bind(null, element);
        element.onmousedown = cardMouseDown.bind(null, element);

        playerDeck?.append(element);
    }
    playerDeck?.style.setProperty("--count", deck.length.toString());
}


let zIndex = 10;
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

function dragMouseUp() {
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
}

function dragMouseMove(event: MouseEvent) {
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
}
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mouseup", (_) => {
    if (drag.active) {
        dragMouseUp(); return
    }
});
document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (drag.active) {
        dragMouseMove(event);
        return;
    }
    if (beamAttackOrigin.style.display != "none") {
        updateBeamAttackAngle();
    }
});

declare let dark: boolean;
let darkmodeButton = <HTMLButtonElement>document.getElementById("darkmode-switch");
darkmodeButton.addEventListener("click", (event) => {
    dark = !dark;
    localStorage.setItem("dark", dark.toString());
    if (dark) {
        document.documentElement.classList.add('dark-root')
    } else {
        document.documentElement.classList.remove('dark-root')
    }
})

export function loadUi(client: Client): (packet: ServerPacket) => void {
    activeClient = client;
    createGridElements(client.board);
    createPlayerHandElements(client.player.deck);
    return handleReceivedPacket;
}