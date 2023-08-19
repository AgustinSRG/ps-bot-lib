// Example usage

import { PokemonShowdownBot } from "./src";

const bot = new PokemonShowdownBot({
    // Configuration
    host: "sim3.psim.us",
    port: 443,
    secure: true,
    serverId: "showdown",
});

bot.on("error", err => {
    // When an error happens, the bot will emit the 'error' event
    // Make sure to handle it, or otherwise the process will exit
    console.error(err);
});

bot.on("connecting", () => {
    console.log("Bot connecting to the server...");
});

bot.on("connected", () => {
    console.log("Bot connected!");
});

bot.on("disconnected", () => {
    // If the bot disconnects, it will retry connecting to the server
    // after 10s by default, you can change it in the configuration
    console.log("Bot disconnected!");
});

bot.on("can-login", () => {
    // Listen for this event to be able to log into an account
    bot.rename("Example account", "eXampl3Pa5w0rd");
});

bot.on("rename-failure", err => {
    // Could not log in (maybe invalid password?)
    console.log("Could not log in. Error: " + err.message);
});

bot.on("renamed", nick => {
    // This event indicates you bot successfully logged in
    console.log("Renamed: " + nick);

    // Now you can send commands
    bot.sendToGlobal("/join Example Room");
    bot.pm("Example User", "Hello!");
});

bot.on("line", (room, line, spl, isInitialMessage) => {
    // This event is emitted when the bot receives a message line form the server
    // room is the room identifier the line was received from, an empty string means is a global message
    // line is the raw line received
    // spl is the line splitted by the | character
    // isInitialMessage is true if the line was received in the room initializing message, meaning it may be an old message
    console.log(`Received message from room: ${room}, line: ${line}`);
});

bot.on("sent", msg => {
    // This event is emitted when the bot sends a message to the server
    console.log("Sent message: " + msg);
});

bot.connect();
