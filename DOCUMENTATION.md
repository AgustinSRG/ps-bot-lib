# Documentation - Pokemon Showdown bot library

In order to install the library to use for your project, run the following command:

```sh
npm install --save @asanrom/ps-bot-lib
```

To use the library, import the class `PokemonShowdownBot` from it:

```ts
import { PokemonShowdownBot } from "@asanrom/ps-bot-lib";
```

## Constructor

When calling the `PokemonShowdownBot` constructor, you are required to provide a configuration object.

```ts
const bot = new PokemonShowdownBot({
    // Configuration
    host: "sim3.psim.us",
    port: 443,
    secure: true,
    serverId: "showdown",
});
```

### Required configuration properties

| Property name | Type | Description |
| -- | -- | -- |
| `host` | `string` | Hostname of the Pokemon Showdown server to connect to. Example: `sim3.psim.us` for the main server, or `localhost` for a local server. |
| `port` | `number` | WebSockets port of the Pokemon Showdown server. For example: `433` is used for the main server, while `8000` is used by default when running a local server. |
| `secure` | `boolean` | Set it to `true` to use TLS. Many public servers, including the main server, use secure connections. |
| `serverId` | `string` | Server ID used to generate the authentication tokens. For the main server it is `showdown`. For localhost is `localhost` |

### Optional configuration properties

| Property name | Type | Description | Default value |
| -- | -- | -- | -- |
| `loginServer` | `string` | Login server host | `play.pokemonshowdown.com` | 
| `maxLinesSend` | `number` | Max number of lines the bot can send at the same time | `3` |
| `sendBufferMaxLength` | `number` | Length of the sending messages buffer. This buffer is used to pack messages together. | `6` |
| `chatThrottleDelay` | `number` | Delay, in milliseconds, to wait before flushing the message buffer. | `200` |
| `connectionRetry` | `boolean` | Set it to `true` for the bot to automatically reconnect to the server. | `true` |
| `connectionRetryDelay` | `number` | Delay, in milliseconds, to wait before reconnecting | `10000` |

## Methods

### Method: isConnected()

Checks if the bot is connected to the server.

Returns a `boolean`, `true` if connected.

```ts
const connected = bot.isConnected();

if (connected) {
    console.log("Bot is connected.");
} else {
    console.log("Bot is not connected.");
}
```

### Method: getBotNick()

Obtains the bot nick.

Returns a `string`, being the current bot nick.

```ts
const nick = bot.getBotNick();

console.log("Bot nick: " + nick);
```

### Method: connect()

Connects to the Pokemon Showdown server.

```ts
bot.connect();
```

### Method: disconnect()

Disconnects the bot from the server.

If the `connectionRetry` is `true`, calling the `disconnect` method will stop the bot from reconnecting.

```ts
bot.disconnect();
```

### Method: reconnect()

Disconnects from the server, then immediately reconnects.

```ts
bot.reconnect();
```

### Method: getRename(username, password)

Makes a request to the login server, returning a promise of the authentication token.

Parameters:

 - `username` - Account username
 - `password` - Account password (if unregistered, you can leave it blank)

Returns a promise, resolving into the authentication token.

```ts
async function login() {
    const token = await bot.getRename("User", "Password");
    bot.sendToGlobal(`/trn User,0,${token}`);
}
```

### Method: rename(username, password)

Renames the bot, making any necessary requests to the login server and sending the appropriate commands to the server.

If successful, a `renamed` event will be emitted.

If it fails, a `rename-failure` event will be emitted.

```ts
bot.rename("User", "Password");
```

### Method: logout()

Logs out of the current account, turning into a guest.

```ts
bot.logout();
```

### Method: send(data)

Sends raw messages to the server. It is preferred to use `sendTo`, but this method is available for sending arbitrary messages.

Parameters:

 - `data` - It can be a string, or an array of strings.

```ts
bot.send('|/pm user, Hi!');
```

### Method: sendTo(room, data)

Sends messages to a room.

Parameters:

 - `room` - The room you want to send messages to.
 - `data` - It can be a string, or an array of strings.

```ts
bot.sendTo("lobby", "Hello all!");
```

### Method: sendToGlobal(data)

Sends messages to the global room, usually for sending global commands.

Parameters:

 - `data` - It can be a string, or an array of strings.

```ts
bot.sendToGlobal("/join lobby");
```

### Method: pm(user, data)

Sends private messages.

Parameters:

 - `user` - Name of the user to send the messages to.
 - `data` - It can be a string, or an array of strings.


```ts
bot.pm("User", "Hello!");
```

### Method queryRooms()

Requests the list of rooms to the server. It will emit a `rooms` event.

```ts
bot.on("rooms" rooms => {
    console.log(rooms);
});

bot.queryRooms();
```

### Method: joinRoom(room, silent)

Joins a room.

Parameters:

 - `room` - The room ID or name
 - `silent` - True to tell the server not to respond with an error message on failure.

```ts
bot.joinRoom("Lobby");
```

### Method: leaveRoom(room, silent)

Leaves a room.

Parameters:

 - `room` - The room ID or name
 - `silent` - True to tell the server not to respond with an error message on failure.

```ts
bot.leaveRoom("Lobby");
```

### Method: destroy()

Closes any connections and releases any resources.

```ts
bot.destroy();
```

## Events

### Event: 'error'

The `error` event is emitted when an error happens. Listen for this event to log any errors.

Parameters:

 - `err` - The error thrown.

```ts
bot.on("error", err => {
    console.error(err);
});
```

### Event: 'connecting'

The `connecting` is emitted when the bot is connecting to the server.

```ts
bot.on("connecting", () => {
    console.log("Connecting...");
});
```

### Event: 'connected'

The `connected` is emitted when the bot connects to the server.

```ts
bot.on("connected", () => {
    console.log("Connected!");
});
```

### Event: 'disconnected'

The `disconnected` is emitted when the bot disconnects from the server, or when the connection fails.

Parameters:

 - `err` - The error, containing the `code` and the `reason`.

```ts
bot.on("disconnected", err => {
    console.log("Disconnected! Code: " + err.code + " | Reason: " + err.reason);
});
```

### Event: 'message'

The `message` is emitted for every message received from the server.

Parameters:

 - `msg` - The message.

```ts
bot.on("message", msg => {
    console.log("Received message: " + msg);
});
```

### Event: 'sent'

The `sent` is emitted for every message the bot sends to the server.

Parameters:

 - `sent` - The message.

```ts
bot.on("sent", msg => {
    console.log("Sent message: " + msg);
});
```
