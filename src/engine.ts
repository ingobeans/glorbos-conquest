const VERSION = "0.1.0";

interface Card {
    name: string
}
interface LivingEntity {
    health: number;
}
class SpellCard { }

class Player {
    deck: Card[] = [];
    spelldeck: SpellCard[] = [];
    gold: number = 0;
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
    tiles: Tile[] = [];
}

class Game {
    players: Player[] = [];
    board: Board = new Board();
}
