import { Card, cardRegistry } from "../cards";
import { Game } from "../engine";
import { loadUi } from "./ui";

let game = new Game(5);

console.log(cardRegistry);

loadUi(game);