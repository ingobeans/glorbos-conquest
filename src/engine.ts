import { populate } from "./registry";
import { Card, cardRegistry, CardRoundData } from "./cards"
import { SpellCard, spellCardRegistry } from "./spellcards"
import { PlaceCardServerPacket, ErrorServerPacket, ServerPacket, UpdateCardRoundDataServerPacket, } from "./server_packets";
import { BoardPosition } from "./board";
import { clone, decodePacket } from "./utils";
import { CardAction, cardActionsRegistry, TileHighlightColor } from "./card_actions";
import { CardActionPlayerPacket, PlaceCardPlayerPacket, PlayerPacket, StatePlayerPacket, StatePlayerPacketType } from "./player_packets";

populate();

// Source - https://stackoverflow.com/a/2450976
// Posted by ChristopheD, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-04, License - CC BY-SA 4.0
function shuffle(array: any[]) {
    var copy = [], n = array.length, i;
    while (n) {
        i = Math.floor(Math.random() * array.length);
        if (i in array) {
            copy.push(array[i]);
            delete array[i];
            n--;
        }
    }
    return copy;
}

class Deck {
    cards: Card[];
    game: Game;
    constructor(game: Game) {
        this.cards = [];
        this.game = game;
        this.populateCards();
    }
    populateCards() {
        this.cards = [];
        for (let card of cardRegistry) {
            let cloned = clone(card);
            cloned.entityId = this.game.currentEntityID;
            this.cards.push(cloned);
            this.game.currentEntityID++;
        }
        this.cards = shuffle(this.cards);
    }
    pullOne(): Card {
        return <Card>this.pull(1)[0];
    }
    pull(amt: number): Card[] {
        let result = [];
        for (let i = 0; i < amt; i++) {
            if (this.cards.length == 0) {
                this.populateCards();
            }
            result.push(<Card>this.cards.pop());
        }
        return result;
    }
}

export class Player {
    deck: Card[];
    spelldeck: SpellCard[] = [];
    gold: number = 0;
    playerIndex: number = 0;

    constructor(deckSize: number, deck: Deck, playerIndex: number) {
        this.deck = deck.pull(deckSize);
        this.playerIndex = playerIndex;
    }
    hasCard(cardEntityId: number): boolean {
        for (let card of this.deck) {
            if (card.entityId == cardEntityId) {
                return true;
            }
        }
        return false;
    }
    removeCard(cardEntityId: number) {
        this.takeCard(cardEntityId);
    }
    tryTakeCard(cardEntityId: number): Card | null {
        if (this.hasCard(cardEntityId)) {
            return this.takeCard(cardEntityId);
        }
        return null;
    }
    takeCard(cardEntityId: number): Card {
        for (let i = 0; i < this.deck.length; i++) {
            let card = <Card>this.deck[i];
            if (card.entityId == cardEntityId) {
                return <Card>this.deck.splice(i, 1)[0];
            }
        }
        throw Error("Card doesnt exist !");
    }
    tryBorrowCard(cardEntityId: number): Card | null {
        if (this.hasCard(cardEntityId)) {
            return this.borrowCard(cardEntityId);
        }
        return null;
    }
    borrowCard(cardEntityId: number): Card {
        for (let i = 0; i < this.deck.length; i++) {
            let card = <Card>this.deck[i];
            if (card.entityId == cardEntityId) {
                return card;
            }
        }
        throw Error("Card doesnt exist !");
    }
}

export class PlacedCard {
    card: Card;
    ownerIndex: number;

    constructor(card: Card, owner: number | Player) {
        if (owner instanceof Player)
            owner = owner.playerIndex;
        this.card = card;
        this.ownerIndex = owner;
    }
}

export class Tile {
    cards: PlacedCard[] = [];
    tryTakeLast(): PlacedCard | undefined {
        return this.cards.splice(this.cards.length - 1, 1)[0];
    }
    takeLast(): PlacedCard {
        let l = this.tryTakeLast();
        if (l == undefined)
            throw Error("Tile.getLast() failed because tile has no cards");
        return l;
    }
    tryBorrowLast(): PlacedCard | undefined {
        return this.cards[this.cards.length - 1];
    }
    borrowLast(): PlacedCard {
        let l = this.tryBorrowLast();
        if (l == undefined)
            throw Error("Tile.getLast() failed because tile has no cards");
        return l;
    }
}

export class Board {
    size: number;
    tiles: Tile[] = [];
    constructor(size: number) {
        this.size = size;
        for (let i = 0; i < size * size; i++) {
            this.tiles.push(new Tile());
        }
    }
    anyActionAvailable(placedCard: PlacedCard, player: Player): boolean {
        for (let action of placedCard.card.actions) {
            let actionInstance = new (<any>action).constructor();
            if (actionInstance.available(this, placedCard, player)) {
                return true;
            }
        }
        return false;
    }
    getHighlightedTiles(placedCard: PlacedCard, player: Player) {
        let highlights: [BoardPosition, TileHighlightColor][] = [];
        for (let action of placedCard.card.actions) {
            let actionInstance = new (<any>action).constructor();
            if (actionInstance.available(this, placedCard, player)) {
                let tiles = action.highlightsTiles(this, placedCard, player);
                highlights = highlights.concat(tiles);
            }
        }
        return highlights;
    }
    tryFindCardOnBoard(card: Card | PlacedCard | number): null | { placedCard: PlacedCard, topOfTile: boolean, tile: Tile, position: BoardPosition } {
        if (card instanceof PlacedCard) {
            card = card.card.entityId;
        } else if (card instanceof Card) {
            card = card.entityId;
        }
        for (let [index, tile] of this.tiles.entries()) {
            for (let [cardIndex, c] of tile.cards.entries()) {
                if (c.card.entityId == card) {
                    return {
                        placedCard: c,
                        topOfTile: cardIndex == tile.cards.length - 1,
                        position: this.indexToPosition(index),
                        tile: tile,
                    }
                }
            }
        }
        return null;
    }
    findCardOnBoard(card: Card | PlacedCard | number): { placedCard: PlacedCard, topOfTile: boolean, tile: Tile, position: BoardPosition } {
        let result = this.tryFindCardOnBoard(card);
        if (card == null) {
            throw new Error("Card not found");
        }
        return <any>result;
    }
    positionOf(card: Card | PlacedCard | number): BoardPosition {
        return this.findCardOnBoard(card).position;
    }
    placeCardAt(card: PlacedCard, position: BoardPosition) {
        this.tiles[position.x + position.y * this.size]?.cards.push(card);
    }
    getTileAt(position: BoardPosition): Tile {
        return <Tile>(this.tiles[this.positionToIndex(position)]);
    }
    canPlaceAt(placedCard: PlacedCard, position: BoardPosition): boolean {
        let tile = this.getTileAt(position);
        let last = tile.tryBorrowLast();
        if (last) {
            let canStack = last.card.canStack(last, placedCard);
            if (!canStack) {
                return false;
            }

        }
        return true
    }
    indexToPosition(index: number): BoardPosition {
        return new BoardPosition(index % this.size, Math.floor(index / this.size));
    }
    positionToIndex(position: BoardPosition): number {
        return position.x + position.y * this.size;
    }
}

export class Game {
    players: Player[] = [];
    board: Board;
    deck: Deck;
    currentEntityID: number = 0;
    playerTurn: number = 0;
    sendPacketsCallback: (packets: ServerPacket[], playerIndex: number) => void;
    constructor(boardSize: number, sendPacketCallback: (packets: ServerPacket[], playerIndex: number) => void) {
        this.sendPacketsCallback = sendPacketCallback;
        this.deck = new Deck(this);
        this.board = new Board(boardSize);
        for (let i = 0; i < 2; i++)
            this.addPlayer();
    }
    addPlayer() {
        let player = new Player(5, this.deck, this.players.length);
        this.players.push(player);
    }
    sendPackets(packets: ServerPacket[], player: Player | number | undefined = undefined) {
        if (player == undefined) {
            for (let [index, _player] of this.players.entries()) {
                this.sendPacketsCallback(packets, index);
            }
            return
        }
        if (player instanceof Player) {
            player = this.players.indexOf(player);
            if (player == -1)
                throw Error("Player not found");
        }
        this.sendPacketsCallback(packets, player);
    }
    processPlayerPacket(packet: PlayerPacket) {
        let player = <Player>this.players[this.playerTurn];
        if (packet instanceof CardActionPlayerPacket) {
            let placedCardBoardDetails = this.board.tryFindCardOnBoard(packet.cardEntityId);
            if (!placedCardBoardDetails) {
                console.warn("Card not found on board");
                return;
            }
            let placedCard = placedCardBoardDetails.placedCard;
            if (placedCard.ownerIndex != player.playerIndex) {
                console.warn("Card not owned by the right player");
                return;
            }
            let cardAction: CardAction = decodePacket(packet.cardActionPacket, cardActionsRegistry);
            // check that the card actually has the specified action

            let found = false;
            for (let action of placedCard.card.actions) {
                let actionInstance = new (<any>action).constructor();

                if (actionInstance.name == cardAction.name) {
                    found = true;
                }
            }
            if (!found) {
                console.warn("Action not found for card");
                return;
            }

            if (placedCardBoardDetails.topOfTile && cardAction.valid(this.board, placedCard, player) && cardAction.available(this.board, placedCard, player)) {
                cardAction.use(this, placedCardBoardDetails.tile, placedCard, player);
                if (cardAction.usesResources.length > 0) {
                    cardAction.useResources(this, placedCardBoardDetails.tile, placedCard, player);
                    this.sendPackets([new UpdateCardRoundDataServerPacket(placedCard.card.entityId, placedCard.card.roundData)]);
                }
            } else {
                console.warn("Action cant be used on card.");
                return;
            }
        }
        else if (packet instanceof PlaceCardPlayerPacket) {
            let card = player.tryBorrowCard(packet.cardEntityId);
            if (!card) {
                console.warn("Card not found");
                return;
            }

            let placed = new PlacedCard(card, player);

            if (!this.board.canPlaceAt(placed, packet.position)) {
                console.warn("Tile already populated");
                return;
            }

            player.removeCard(packet.cardEntityId);
            this.board.placeCardAt(placed, packet.position);
            let serverPacket = new PlaceCardServerPacket(card, packet.position);
            this.sendPackets([serverPacket]);
            return;
        }
        else if (packet instanceof StatePlayerPacket) {
            switch (packet.type) {
                case StatePlayerPacketType.EndTurn:
                    this.playerTurn = (this.playerTurn + 1) % this.players.length;
                    for (let card of player.deck) {
                        card.roundData = new CardRoundData();
                    }
                    break;
            }
        } else {
            console.warn("Unknown packet");
            return
        }
        return;
    }
}
