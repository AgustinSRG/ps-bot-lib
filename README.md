# Pokemon Showdown bot library

[![Node.js CI](https://github.com/AgustinSRG/ps-bot-lib/actions/workflows/node.js.yml/badge.svg)](https://github.com/AgustinSRG/ps-bot-lib/actions/workflows/node.js.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/AgustinSRG/ps-bot-lib/blob/master/LICENSE)

Simple library to create bots for [Pokemon Showdown](https://github.com/smogon/pokemon-showdown), coded in typescript, for NodeJS.

## Installation

In order to install the library to use for your project, run the following command:

```sh
npm install --save @asanrom/ps-bot-lib
```

## Usage

You can use the library to instantiate Pokemon Showdown bots, controlling their actions and listening for events.

Example code:

```ts
import { PokemonShowdownBot } from "@asanrom/ps-bot-lib";

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
```

## Documentation

Check the [documentation](./DOCUMENTATION.md) for detailed specifications for configuration, methods and events available.

You can also check the [auto generated documentation](https://agustinsrg.github.io/ps-bot-lib/).

## Building

In order to build this library, you need:

 - [NodeJS](https://nodejs.org/en), latest stable version.

Run the following command to install dependencies:

```sh
npm install
```

Run the following command to build the typescript into javascript:

```sh
npm run build
```
