import { Card, cardRegistry } from "../cards";
import { Game, Player } from "../engine";
import { PlayerPacket, playerPacketsRegistry } from "../player_packets";
import { ServerPacket, serverPacketRegistry } from "../server_packets";
import { clone, decodePacket, encodePacket } from "../utils";
import { Client } from "./client";
import { loadUi } from "./ui";

let game: Game;
let client: Client;
let handleReceivedPacket: (packet: ServerPacket) => void;

function sendPlayerPacket(packet: PlayerPacket) {
    // encode and re-decode packets to simulate network transmission
    // for the sake of ensuring parity.

    let packetEncoded = encodePacket(packet, playerPacketsRegistry);
    let packetDecoded = decodePacket(packetEncoded, playerPacketsRegistry);

    game.processPlayerPacket(packetDecoded);
    console.log(client.player);
}

function sendServerPacket(packets: ServerPacket[], playerIndex: number) {
    if (playerIndex != 0)
        return;

    function handlePacket(packet: ServerPacket) {
        let packetEncoded = encodePacket(packet, serverPacketRegistry);
        let packetDecoded = decodePacket(packetEncoded, serverPacketRegistry);

        client.receivePacket(packetDecoded);
        handleReceivedPacket(packetDecoded);
    }

    packets.forEach(handlePacket);
}

game = new Game(5, sendServerPacket);
client = new Client(clone(game.board), clone(<Player>game.players[0]), sendPlayerPacket);

console.log(cardRegistry);

handleReceivedPacket = loadUi(client);