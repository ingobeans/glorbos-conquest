import { populate } from "./registry";
import { Card, cardRegistry } from "./cards"
import { SpellCard, spellCardRegistry } from "./spellcards"

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
    constructor() {
        this.cards = [];
        this.populateCards();
    }
    populateCards() {
        this.cards = [];
        for (let card of cardRegistry) {
            let clone = structuredClone(card);
            this.cards.push(clone);
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

class Player {
    deck: Card[];
    spelldeck: SpellCard[] = [];
    gold: number = 0;
    constructor(deckSize: number, deck: Deck) {
        this.deck = deck.pull(deckSize);
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
    deck: Deck;
    constructor(boardSize: number) {
        this.deck = new Deck();
        this.players = [new Player(5, this.deck), new Player(5, this.deck)];
        this.board = new Board(boardSize);
    }
}
