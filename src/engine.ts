import { populate } from "./registry";
import { Card, cardRegistry } from "./cards"
import { SpellCard, spellCardRegistry } from "./spellcards"
import { PlaceCardServerPacket, ErrorServerPacket, ServerPacket, } from "./server_packets";
import { BoardPosition } from "./board";
import { clone } from "./utils";
import { CardAction } from "./card_actions";
import { PlaceCardPlayerPacket, PlayerPacket, StatePlayerPacket, StatePlayerPacketType } from "./player_packets";

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

class Tile {
    cards: PlacedCard[] = [];
    tryGetLast(): PlacedCard | undefined {
        return this.cards[this.cards.length - 1];
    }
    getLast(): PlacedCard {
        let l = this.tryGetLast();
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
    positionOf(card: Card | PlacedCard): BoardPosition {
        if (card instanceof PlacedCard) {
            card = card.card;
        }
        for (let [index, tile] of this.tiles.entries()) {
            for (let c of tile.cards) {
                if (c.card.entityId == card.entityId) {
                    return this.indexToPosition(index);
                }
            }
        }
        throw Error("Card not found");
    }
    placeCardAt(card: PlacedCard, position: BoardPosition) {
        this.tiles[position.x + position.y * this.size]?.cards.push(card);
    }
    getTileAt(position: BoardPosition): Tile {
        return <Tile>(this.tiles[this.positionToIndex(position)]);
    }
    canPlaceAt(placedCard: PlacedCard, position: BoardPosition): boolean {
        let tile = this.getTileAt(position);
        let last = tile.tryGetLast();
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
        if (packet instanceof CardAction) { }
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
                    break;
            }
        } else {
            console.warn("Unknown packet");
            return
        }
        return;
    }
}
