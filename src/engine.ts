import { populate } from "./registry";
import { Card, cardRegistry } from "./cards"
import { SpellCard, spellCardRegistry } from "./spellcards"
import { PlaceCardPlayerAction, PlayerAction, ProcessPlayerActionError, ProcessPlayerActionResult, StatePlayerAction, StatePlayerActionType } from "./actions";
import { BoardPosition } from "./board";

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
            let clone = structuredClone(card);
            clone.entityId = this.game.currentEntityID;
            this.cards.push(clone);
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
    constructor(deckSize: number, deck: Deck) {
        this.deck = deck.pull(deckSize);
    }
    hasCard(cardEntityId: number): boolean {
        for (let card of this.deck) {
            if (card.entityId == cardEntityId) {
                return true;
            }
        }
        return false;
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

export class Board {
    size: number;
    tiles: Tile[] = [];
    constructor(size: number) {
        this.size = size;
        for (let i = 0; i < size * size; i++) {
            this.tiles.push(new Tile());
        }
    }
    placeCardAt(card: PlacedCard, position: BoardPosition) {
        this.tiles[position.x + position.y * this.size]?.cards.push(card);
    }
}

export class Game {
    players: Player[];
    board: Board;
    deck: Deck;
    currentEntityID: number = 0;
    playerTurn: number = 0;
    constructor(boardSize: number) {
        this.deck = new Deck(this);
        this.players = [new Player(5, this.deck), new Player(5, this.deck)];
        this.board = new Board(boardSize);
    }
    processPlayerAction(action: PlayerAction): ProcessPlayerActionResult {
        let player = <Player>this.players[this.playerTurn];
        if (action instanceof PlaceCardPlayerAction) {
            let card = player.tryTakeCard(action.cardEntityId);
            if (!card) {
                return new ProcessPlayerActionError("Card not found");
            }
            let placed = new PlacedCard(card, player);
            this.board.placeCardAt(placed, action.position);
        }
        else if (action instanceof StatePlayerAction) {
            switch (action.type) {
                case StatePlayerActionType.EndTurn:
                    this.playerTurn = (this.playerTurn + 1) % this.players.length;
                    break;
            }
        }
        return new ProcessPlayerActionError("placeholder");
    }
}
