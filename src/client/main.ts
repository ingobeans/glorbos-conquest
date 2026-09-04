import { cardRegistry } from "../cards";
import { Game, Player } from "../engine";
import { clone } from "../utils";
import { Client } from "./client";
import { loadUi } from "./ui";

let game = new Game(5);
let client = new Client(clone(game.board), clone(<Player>game.players[0]), game.processPlayerAction.bind(game));

console.log(cardRegistry);

loadUi(client);