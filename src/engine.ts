const VERSION = "0.1.2";

import { populate } from "./registry";
import { Card, cardRegistry } from "./cards"
import { SpellCard, spellCardRegistry } from "./spellcards"

populate();

class Player {
    deck: Card[];
    spelldeck: SpellCard[] = [];
    gold: number = 0;
    constructor(deckSize: number) {
        this.deck = [];
        for (let i = 0; i < deckSize; i++) {
            let card = cardRegistry[Math.floor(Math.random() * cardRegistry.length)];
            this.deck.push(<any>card);
        }
    }
}

class PlacedCard {
    card: Card;
    owner: Player;

    constructor(card: Card, owner: Player) {
        this.card = card;
        this.owner = owner;
    }
}

class Tile {
    cards: PlacedCard[] = [];
}

class Board {
    size: number;
    tiles: Tile[] = [];
    constructor(size: number) {
        this.size = size;
        for (let i = 0; i < size * size; i++) {
            this.tiles.push(new Tile());
        }
    }
}

export class Game {
    players: Player[];
    board: Board;
    constructor(boardSize: number) {
        this.players = [new Player(5), new Player(5)];
        this.board = new Board(boardSize);
    }
}
