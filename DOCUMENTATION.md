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

### Event: 'can-login'

The `can-login` is emitted when the server send the challenge string, meaning you can login. You may call the `rename` method.

```ts
bot.on("can-login", () => {
    bot.rename("User", "Password");
});
```

### Event: 'rename-failure'

The `rename-failure` is emitted if the `rename` method results into a login error, for example due to high load, or due to the credentials being wrong.

Parameters:

 - `err` - The error message.

```ts
bot.on("rename-failure", err => {
    console.error(err);
});
```

### Event: 'renamed'

The `renamed` event is emitted when the bot nick changes into an authenticated user (it won't be emitted for guest names).

Parameters:

 - `nick` - The bot nickname

```ts
bot.on("renamed", nick => {
    console.log("Bot nick changed to: " + nick);
});
```

### Event: 'line'

The `line` event is emitted for every line message received from the server. Use it for any custom server  message you want to handle.

Parameters:

 - `room` - The room where the line was received. An empty string means it's a global server message.
 - `line` - The raw line message
 - `splittedLine` - Line splitted by `|`. The initial `|` is skipped, so `splittedLine[0]` is the message type.
 - `initialMsg` - True if the line was received as an initial room message. This can be used to distinguish historical messages from real time ones.

```ts
bot.on("line", (room, line, splittedLine, initialMsg) => {
    switch (splittedLine[0]) {
        case "J":
            console.log(`User ${splittedLine[1]} joined the room ${room}`);
            break;
        case "L":
            console.log(`User ${splittedLine[1]} left the room ${room}`);
            break;
        default:
            console.log(`[${room}] ${line}`);
    }
});
```

### Event: 'formats'

The `formats` event is emitted when the list of formats is received from the server.

Parameters:

 - `formats` - Map containing all the available formats


```ts
bot.on("formats", formats => {
    console.log("Received list of events. Size: " + formats.size);
    if (formats.has(toId("[Gen 9] Random Battle"))) {
        console.log("The server supports [Gen 9] Random Battle");
    }
});
```

### Event: 'query-response'

The `query-response` event is emitted when a JSON response is received from the server, usually when calling certain system commands.

Parameters:

 - `queryType` - Type of query
 - `response` - The parsed JSON response

```ts
bot.on("query-response", (queryType, response) => {
    if (queryType === "userdetails") {
        console.log("User details received: " + response.name + " | Status: " + response.status);
    }
});
bot.sendToGlobal("/cmd userdetails user");
```

### Event: 'rooms'

The `rooms` event is emitted when the list of available rooms is received from the server.

Parameters:

 - `rooms` - List of rooms

```ts
bot.on("rooms", rooms => {
    console.log(`The server has ${rooms.chat.length} public chat rooms`);
});
bot.queryRooms();
```

### Event: 'popup'

The `popup` event is emitted when a popup is received from the server.

Parameters:

 - `message` - The popup message.

```ts
bot.on("popup", message => {
    console.log("Popup: " + message);
});
```

### Event: 'room-join'

The `room-join` event is emitted when the bot joins a room.

Parameters:

 - `room` - The room ID
 - `roomType` - The room type (server chosen), like `chat` or `battle`

```ts
bot.on("room-join", (room, roomType) => {
    console.log("Joined: " + room + " | Type: " + roomType);
});
```

### Event: 'room-join-failure'

The `room-join-failure` is emitted as a response to the `/join` command, when it fails.

Parameters:

 - `room` - The room trying to join
 - `code` - The error code
 - `message` - The error message

```ts
bot.on("room-join-failure", (room, code, message) => {
    console.log("Could not join: " + room + " | Code: " + code + " | Message: " + message);
});
```

### Event: 'room-title'

The `room-title` event is emitted when the server send the title of a room.

Parameters:

 - `room` - The room ID
 - `title` - The title of the room

```ts
bot.on("room-title", (room, title) => {
    console.log("Title of " + room + ": " + title);
});
```

### Event: 'room-rename'

The `room-rename` event is emitted when a room changes its name.

Parameters:

 - `room` - The old room ID
 - `newId` - The new room ID
 - `newTitle` - The new room title

```ts
bot.on("room-rename", (room, newId, newTitle) => {
    console.log(`The room ${room} was renamed to ${newId}, with title: ${newTitle}`);
});
```

### Event: 'room-leave'

The `room-leave` event is emitted when the bot leaves a room.

Parameters:

 - `room` - The room ID

```ts
bot.on("room-leave", room => {
    console.log("Left room: " + room);
});
```

### Event: 'room-users'

The `room-users` event is emitted when the bot joins a room, and the server send the list of the users inside of it.

Parameters:

 - `room` - The room ID
 - `userCount` - Number of online users
 - `users` - List of authenticated users

```ts
bot.on("room-users", (room, userCount, users) => {
    console.log(`The room ${room} has ${userCount} users.`);
    console.log("List of users: " + users.map(u => u.name).join(", "));
});
```

### Event: 'user-join'

The `user-join` event is emitted whenever an user joins a room the bot is connected to.

Parameters:

 - `room` - The room ID
 - `user` - The user identity

```ts
bot.on("user-join", (room, user) => {
    console.log(`The user ${user.name} joined the room ${room}.`);
});
```

### Event: 'user-leave'

The `user-leave` event is emitted whenever an user leaves a room the bot is connected to.

Parameters:

 - `room` - The room ID
 - `user` - The user identity

```ts
bot.on("user-leave", (room, user) => {
    console.log(`The user ${user.name} left the room ${room}.`);
});
```

### Event: 'user-rename'

The event `user-rename` is emitted when an user publicly changes their name or group in a room the bot is connected to.

Parameters:

 - `room` - The room ID
 - `user` - The old user ID
 - `newUser` - The new user identity

```ts
bot.on("user-rename", (room, user, newUser) => {
    console.log(`The user ${user} changed their name to ${newUser.group}${newUser.name} in the room ${room}.`);
});
```

### Event: 'chat'

The `chat` event is emitted when the bot receives a chat message from another user.

Parameters:

 - `room` - The room ID
 - `user` - The user identity
 - `message` - The parsed message
 - `serverTime` - Server time of the message (Unix seconds). This is optional, so may be undefined.

```ts
bot.on("chat", (room, user, message, serverTime) => {
    if (message.type === "command") {
        console.log(`[CHAT-CMD] [${room}] ${user.group}${user.name}: /${message.command} ${message.argument}`);
    } else {
        console.log(`[CHAT] [${room}] ${user.group}${user.name}: ${message.message}`);
    }
});
```


### Event: 'chat-echo'

The `chat-echo` event is emitted when the bot receives a chat message from itself.

This can be used to check if a sent message actually was accepted in the room.

Parameters:

 - `room` - The room ID
 - `user` - The user identity
 - `message` - The parsed message
 - `serverTime` - Server time of the message (Unix seconds). This is optional, so may be undefined.

```ts
bot.on("chat-echo", (room, user, message, serverTime) => {
    if (message.type === "command") {
        console.log(`[CHAT-CMD] [${room}] ${user.group}${user.name}: /${message.command} ${message.argument}`);
    } else {
        console.log(`[CHAT] [${room}] ${user.group}${user.name}: ${message.message}`);
    }
});
```

### Event: 'pm'

The `pm` event is emitted whenever the bot receives a private message from another user.

Parameters:

 - `from` - User who sent the message
 - `to` - User who received the message
 - `message` - The parsed message

```ts
bot.on("pm", (from, to, message) => {
    if (message.type === "command") {
        console.log(`[PM-CMD] [TO: ${to.group}${to.name}] ${from.group}${from.name}: /${message.command} ${message.argument}`);
    } else {
        console.log(`[PM] [TO: ${to.group}${to.name}] ${from.group}${from.name}: ${message.message}`);
    }
});
```

### Event: 'pm-echo'

The `pm-echo` event is emitted whenever the bot receives a private message from itself.

It can be used to check if a private message was received.

Parameters:

 - `from` - User who sent the message
 - `to` - User who received the message
 - `message` - The parsed message

```ts
bot.on("pm-echo", (from, to, message) => {
    if (message.type === "command") {
        console.log(`[PM-CMD] [TO: ${to.group}${to.name}] ${from.group}${from.name}: /${message.command} ${message.argument}`);
    } else {
        console.log(`[PM] [TO: ${to.group}${to.name}] ${from.group}${from.name}: ${message.message}`);
    }
});
```
