const VERSION = "0.1.0";

class Card { }
class SpellCard { }

class Player {
    deck: Card[] = [];
    spelldeck: SpellCard[] = [];
    gold: number = 0;
}

class Game {
    players: Player[] = []
}