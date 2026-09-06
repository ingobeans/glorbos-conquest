import { cardRegistry } from "../cards";
import { Game, Player } from "../engine";
import { PlayerPacket, playerPacketsRegistry } from "../player_packets";
import { ServerPacket, serverPacketRegistry } from "../server_packets";
import { clone, decodePacket, EncodedPacket, encodePacket } from "../utils";
import { Client } from "./client";
import { loadUi } from "./ui";

let game = new Game(5);
function callback(playerPacket: PlayerPacket): ServerPacket {
    // encode and re-decode packets to simulate network transmission
    // for the sake of ensuring parity.

    let packetEncoded = encodePacket(playerPacket, playerPacketsRegistry);
    let decodedPacket = decodePacket(packetEncoded, playerPacketsRegistry);

    let receivedPacket = game.processPlayerAction(decodedPacket);
    let receivedPacketEncoded = encodePacket(receivedPacket, serverPacketRegistry);
    let receivedPacketDecoded = decodePacket(receivedPacketEncoded, serverPacketRegistry);

    return receivedPacketDecoded;

}
let client = new Client(clone(game.board), clone(<Player>game.players[0]), callback);

console.log(cardRegistry);

loadUi(client);