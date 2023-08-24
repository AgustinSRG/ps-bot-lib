// Pokemon showdown bot

'use strict';

import { EventEmitter } from "events";
import SockJS from 'sockjs-client';
import Https from 'https';
import { parseUserIdentity, toId } from "./utils";
import { PokemonShowdownBotConfig } from "./config";
import { ChatMessage, RoomsList, UserIdentity, parseChatMessage } from "./models";
import { PokemonShowdownFormat, parsePokemonShowdownFormats } from "./formats";

const Default_Room = ""; // If the server sends a message without specifying the room

const Default_Login_Server = "play.pokemonshowdown.com";
const Default_Server_Id = "showdown";
const Default_Retry_Delay = 10 * 1000;
const Max_Lines_Default = 3;
const Default_Sending_Buffer_Length = 6;
const Default_Chat_Throttle_Delay = 200;

export declare interface PokemonShowdownBot {
    /**
     * Error
     */
    on(event: 'error', handler: (err: Error) => void): this;


    /**
     * Disconnected
     */
    on(event: 'disconnected', handler: (err: { code: string, reason: string }) => void): this;


    /**
     * Connecting
     */
    on(event: 'connecting', handler: () => void): this;

    /**
     * Connected
     */
    on(event: 'connected', handler: () => void): this;

    /**
     * Challenge received, so the bot can log in
     */
    on(event: 'can-login', handler: () => void): this;

    /**
     * Message received (Raw)
     */
    on(event: 'message', handler: (msg: string) => void): this;

    /**
     * Message sent (Raw)
     */
    on(event: 'sent', handler: (msg: string) => void): this;

    /**
     * Rename failed (Login error)
     */
    on(event: 'rename-failure', handler: (err: Error) => void): this;

    /**
     * Renamed successful
     */
    on(event: 'renamed', handler: (nick: string) => void): this;

    /**
     * New line received
     *  - room: Room ID
     *  - line: Line received
     *  - splittedLine: Line splitted by "|". The initial "|" is skipped, so splittedLine[0] is the message type
     *  - initialMsg: True if it's a room initial message
     */
    on(event: 'line', handler: (room: string, line: string, splittedLine: string[], initialMsg: boolean) => void): this;

    /**
     * Receives the list of available battle formats in the server
     */
    on(event: 'formats', handler: (formats: Map<string, PokemonShowdownFormat>) => void): this;

    /**
     * Query response event
     *  - queryType: Type of query
     *  - response: JSON response from the server
     */
    on(event: 'query-response', handler: (queryType: string, response: any) => void): this;

    /**
     * Specific query response for the 'rooms' query
     * It provides the official and public room list of the server.
     */
    on(event: 'rooms', handler: (rooms: RoomsList) => void): this;

    /**
     * Popup received
     */
    on(event: 'popup', handler: (message: string) => void): this;

    /**
     * Event triggered when the bot joins a room
     *  - room: The room ID
     *  - roomType: Room type. Examples: battle,chat
     */
    on(event: 'room-join', handler: (room: string, roomType: string) => void): this;

    /**
     * Event triggered when the bot attempts to join a room
     * but it cannot join. For example, this can happen if the rok does not exist.
     */
    on(event: 'room-join-failure', handler: (room: string, code: string, message: string) => void): this;

    /**
     * Room title received: 
     *  - room: The room ID
     *  - title: Title of the room
     */
    on(event: 'room-title', handler: (room: string, title: string) => void): this;

    /**
     * Event emitted if the room is renamed:
     *  - room: The old room ID
     *  - newId: The new room ID
     *  - newTitle: The new room title
     */
    on(event: 'room-rename', handler: (room: string, newId: string, newTitle: string) => void): this;

    /**
     * Event triggered when the bot leaves a room
     *  - room: The room ID
     */
    on(event: 'room-leave', handler: (room: string) => void): this;

    /**
     * Initial room users list:
     *  - room: The old room ID
     *  - userCount: Number of users (including guests)
     *  - users: List of users
     */
    on(event: 'room-users', handler: (room: string, userCount: number, users: UserIdentity[]) => void): this;

    /**
     * Event triggered when an user joins a room
     *  - room: Room ID
     *  - user: Identity of the user who joined the room
     */
    on(event: 'user-join', handler: (room: string, user: UserIdentity) => void): this;

    /**
     * Event triggered when an user leaves a room
     *  - room: Room ID
     *  - user: Identity of the user who left the room
     */
    on(event: 'user-leave', handler: (room: string, user: UserIdentity) => void): this;

    /**
     * Event triggered when an user leaves a room
     *  - room: Room ID
     *  - user: Id of the renamed user
     *  - newUser: New identity of the user
     */
    on(event: 'user-rename', handler: (room: string, user: string, newUser: UserIdentity) => void): this;

    /**
     * Event triggered when a chat message is received
     * Note: This will not trigger if the bot is the author of the message
     *  - room: Room ID
     *  - user: User who sent the message
     *  - message: The message
     *  - serverTime: The server timestamp for that message
     */
    on(event: 'chat', handler: (room: string, user: UserIdentity, message: ChatMessage, serverTime?: number) => void): this;

    /**
     * Event triggered when a chat message is received, and the bot is the author
     *  - room: Room ID
     *  - user: User who sent the message
     *  - message: The message
     *  - serverTime: The server timestamp for that message
     */
    on(event: 'chat-echo', handler: (room: string, user: UserIdentity, message: ChatMessage, serverTime?: number) => void): this;

    /**
     * Event triggered when a private message is received
     * Note: This will not trigger if the bot is the sender of the message
     *  - from: User who sent the message
     *  - to: User who received the message
     *  - message: The message
     */
    on(event: 'pm', handler: (from: UserIdentity, to: UserIdentity, message: ChatMessage) => void): this;

    /**
     * Event triggered when a private message is received, and the bot is the sender
     *  - from: User who sent the message
     *  - to: User who received the message
     *  - message: The message
     */
    on(event: 'pm-echo', handler: (from: UserIdentity, to: UserIdentity, message: ChatMessage) => void): this;
}

/**
 * Represents a Pokemon Showdown Bot
 */
export class PokemonShowdownBot extends EventEmitter {
    /**
     * Configuration
     */
    public config: PokemonShowdownBotConfig;

    /**
     * The socket
     */
    public socket: WebSocket | null;

    private sendBufferMaxLength: number;
    private chatThrottleDelay: number;
    private maxLinesSend: number;
    private connectionRetryDelay: number;

    /**
     * Timestamp of the last connection
     */
    public lastConnectionTime: number;

    /**
     * Timestamp of the last received message
     */
    public lastMessage: number;

    private connectionRetryTimer: NodeJS.Timeout | null;

    private loginRetryTimer: NodeJS.Timeout | null;

    private sendingQueue: { et: number }[];
    private sendingQueueTimeout: NodeJS.Timeout | null;

    private msgQueue: string[];

    private closed: boolean;
    private connecting: boolean;
    private connected: boolean;

    private status: {
        nick: string;
        isGuest: boolean;
        away: boolean;
    };

    private challengeString: {
        id: string;
        str: string;
    };

    constructor(config: PokemonShowdownBotConfig) {
        super();

        this.config = config;
        this.socket = null;

        this.closed = false;
        this.connected = false;
        this.connecting = false;

        if (config.sendBufferMaxLength !== undefined) {
            this.sendBufferMaxLength = config.sendBufferMaxLength;
        } else {
            this.sendBufferMaxLength = Default_Sending_Buffer_Length;
        }

        if (config.chatThrottleDelay !== undefined) {
            this.chatThrottleDelay = config.chatThrottleDelay;
        } else {
            this.chatThrottleDelay = Default_Chat_Throttle_Delay;
        }

        if (config.maxLinesSend !== undefined) {
            this.maxLinesSend = config.maxLinesSend;
        } else {
            this.maxLinesSend = Max_Lines_Default;
        }

        if (config.connectionRetryDelay !== undefined) {
            this.connectionRetryDelay = config.connectionRetryDelay;
        } else {
            this.connectionRetryDelay = Default_Retry_Delay;
        }

        this.lastConnectionTime = 0;

        this.connectionRetryTimer = null;

        this.loginRetryTimer = null;

        this.msgQueue = [];
        this.sendingQueue = [];
        this.sendingQueueTimeout = null;

        this.status = {
            nick: "",
            isGuest: false,
            away: false,
        };

        this.challengeString = {
            id: "",
            str: "",
        };

        if (config.connectionRetry !== false) {
            this.on('disconnected', () => {
                if (this.closed || this.connecting || this.connected) return;
                this.retryConnect(this.connectionRetryDelay);
            });
        }
    }

    /**
     * Checks if the bot is connected
     * @returns True if connected
     */
    public isConnected(): boolean {
        return this.connected;
    }

    /**
     * Gets the bot nickname
     * @returns The bot nickname
     */
    public getBotNick(): string {
        return this.status.nick;
    }

    /**
     * Gets the server connection URL
     * @returns The server connection URL
     */
    private getConnectionUrl(): string {
        return `${this.config.secure ? 'https' : 'http'}://${this.config.host}:${this.config.port}/showdown/`;
    }

    /**
     * Gets the login URL
     * @returns The login URL
     */
    private getLoginUrl(): string {
        return `https://${this.config.loginServer || Default_Login_Server}/~~${encodeURIComponent(this.config.serverId || Default_Server_Id)}/action.php`;
    }

    /**
     * Resets status
     */
    private reset() {
        if (this.connectionRetryTimer) {
            clearTimeout(this.connectionRetryTimer);
            this.connectionRetryTimer = null;
        }
        if (this.loginRetryTimer) {
            clearTimeout(this.loginRetryTimer);
            this.loginRetryTimer = null;
        }
        this.sendingQueue = [];
        this.msgQueue = [];
        if (this.sendingQueueTimeout) {
            clearTimeout(this.sendingQueueTimeout);
            this.sendingQueueTimeout = null;
        }
        this.challengeString = {
            id: "",
            str: "",
        };
        this.status = {
            nick: "",
            isGuest: false,
            away: false,
        };
    }

    /**
     * Connects to the server
     */
    public connect() {
        if (this.connected) {
            return;
        }
        this.closed = false;
        this.reset();
        this.socket = new SockJS(this.getConnectionUrl());
        this.socket.onerror = err => {
            this.connecting = false;
            this.reset();
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }
            this.emit('error', err);
        };
        this.socket.onopen = () => {
            this.connecting = false;
            this.connected = true;
            this.lastConnectionTime = Date.now();
            this.emit('connected');
        };
        this.socket.onclose = e => {
            if (!this.closed) this.socket = null;
            this.connecting = false;
            this.connected = false;
            this.reset();
            this.emit('disconnected', { code: e.code, reason: e.reason });
        };
        this.socket.onmessage = e => {
            let data = e.data;
            if (typeof data !== "string") {
                data = JSON.stringify(data);
            }
            this.lastMessage = Date.now();
            this.emit('message', data);
            this.receive(data);
        };
        this.connecting = true;
        this.emit('connecting');
    }

    /**
     * Tries the connection
     * @param delay The delay (ms)
     */
    private retryConnect(delay: number) {
        if (this.connectionRetryTimer) {
            clearTimeout(this.connectionRetryTimer);
            this.connectionRetryTimer = null;
        }
        this.connectionRetryTimer = setTimeout(() => {
            if (this.closed) return;
            this.connect();
        }, delay);
    }

    /**
     * Reconnect
     */
    public reconnect() {
        this.disconnect();
        this.connect();
    }

    /**
     * Disconnect
     */
    public disconnect() {
        this.closed = true;
        this.connecting = false;
        this.reset();
        if (this.socket) {
            this.socket.onclose = e => {
                this.emit('disconnected', { code: e.code, reason: e.reason });
            };
            this.socket.close();
            this.socket = null;
        }
    }

    /**
     * Gets rename token
     * @param nick The nick
     * @param pass The password
     * @returns The token
     */
    public getRename(nick: string, pass?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.challengeString.id) {
                return reject("No challenge string");
            }

            let url: URL;

            try {
                url = new URL(this.getLoginUrl());
            } catch (ex) {
                return reject(ex);
            }

            let data = "";

            const requestOptions: Https.RequestOptions = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                agent: false,
            };

            if (!pass) {
                requestOptions.method = 'GET';
                requestOptions.path += '?act=getassertion&userid=' +
                    toId(nick) + '&challengekeyid=' + encodeURIComponent(this.challengeString.id) +
                    '&challenge=' + encodeURIComponent(this.challengeString.str);
            } else {
                requestOptions.method = 'POST';
                data = 'act=login&name=' + toId(nick) + '&pass=' + pass +
                    '&challengekeyid=' + encodeURIComponent(this.challengeString.id) + '&challenge=' +
                    encodeURIComponent(this.challengeString.str);
                requestOptions.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length,
                };
            }

            const req = Https.request(requestOptions, res => {
                res.setEncoding('utf8');
                let str = '';
                res.on('data', chunk => {
                    str += chunk;
                });
                res.on('end', () => {
                    if (str === ';') {
                        reject("Wrong password");
                        return;
                    }
                    if (str.length < 50) {
                        reject("Server error");
                        return;
                    }
                    if (str.includes('heavy load')) {
                        reject("Heavy load");
                        return;
                    }
                    try {
                        const parsedStr = JSON.parse(str.substr(1));
                        if (parsedStr.actionsuccess) {
                            str = parsedStr.assertion;
                        } else {
                            reject("Unknown login error");
                            return;
                        }
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    resolve(str);
                });
            });

            req.on('error', err => {
                reject(err);
            });

            if (data) {
                req.write(data);
            }

            req.end();
        });
    }

    /**
     * Logins into an account or changes nick
     * Failure emits 'rename-failure' event
     * @param nick The nick
     * @param pass The password
     */
    public rename(nick: string, pass?: string) {
        if (toId(this.status.nick) === toId(nick)) {
            this.sendToGlobal('/trn ' + nick);
        } else {
            this.getRename(nick, pass).then(token => {
                if (token) {
                    this.sendToGlobal('/trn ' + nick + ',0,' + token);
                }
            }).catch(err => {
                this.emit("rename-failure", err);
            });
        }
    }

    /**
     * Logs out
     */
    public logout() {
        return this.sendToGlobal("/logout");
    }

    /**
     * Adds a message to the queue
     * @param msg The message
     */
    private addToMsgQueue(msg: string) {
        this.msgQueue.push(msg);
        this.processMessageQueue();
    }

    /**
     * Process message queue
     */
    private processMessageQueue() {
        if (this.sendingQueueTimeout) {
            clearTimeout(this.sendingQueueTimeout);
            this.sendingQueueTimeout = null;
        }

        if (!this.isConnected() || this.msgQueue.length === 0) {
            return;
        }

        const now = Date.now();
        this.sendingQueue = this.sendingQueue.filter(function (msg) {
            return (now < msg.et);
        });

        let timeEx = (this.sendingQueue.length > 0) ? (this.sendingQueue[this.sendingQueue.length - 1].et) : Date.now();

        const spaceInQueue = this.sendBufferMaxLength - this.sendingQueue.length;

        if (spaceInQueue > 0) {
            const linesToSend = [];

            for (let i = 0; i < spaceInQueue && this.msgQueue.length > 0; i++) {
                linesToSend.push(this.msgQueue.shift());
            }

            while (linesToSend.length > 0) {
                const groupLines = [];
                let groupLinesRoom = null;

                for (let i = 0; i < this.maxLinesSend && linesToSend.length > 0; i++) {
                    const roomInLine = linesToSend.indexOf("|") >= 0 ? linesToSend[0].split("|")[0] : "";

                    if (groupLinesRoom === null) {
                        groupLinesRoom = roomInLine;
                    } else if (groupLinesRoom !== roomInLine) {
                        break;
                    }

                    groupLines.push(linesToSend.shift());
                }

                const multiLineMsg = groupLines.join("\n");
                this.socket.send(multiLineMsg);
                this.emit('sent', multiLineMsg);

                for (let i = 0; i < groupLines.length; i++) {
                    timeEx += this.chatThrottleDelay;
                    this.sendingQueue.push({
                        et: timeEx,
                    });
                }
            }
        }

        if (this.msgQueue.length > 0) {
            const waitUntil = (this.sendingQueue.length > 0) ? (Date.now() - this.sendingQueue[0].et) : 0;
            if (waitUntil > 0) {
                this.sendingQueueTimeout = setTimeout(function () {
                    this.sendingQueueTimeout = null;
                    this.processMessageQueue();
                }.bind(this), waitUntil);
            } else {
                this.sendingQueueTimeout = setTimeout(function () {
                    this.sendingQueueTimeout = null;
                    this.processMessageQueue();
                }.bind(this), 1);
            }
        }
    }

    /**
     * Sends message
     * @param data The message(s)
     */
    public send(data: string | string[]) {
        if (!this.socket) return;

        if (!Array.isArray(data)) {
            data = [data.toString()];
        } else {
            data = data.slice();
        }

        for (const msg of data) {
            this.addToMsgQueue(msg);
        }
    }

    /**
     * Sends message to room
     * @param room The room
     * @param data The message(s)
     */
    public sendTo(room: string, data: string | string[]) {
        if (!(data instanceof Array)) {
            data = [data.toString()];
        }
        for (let i = 0; i < data.length; i++) {
            data[i] = (room + '|' + data[i]);
        }
        return this.send(data);
    }

    /**
     * Sends message to global room
     * @param data The message(s)
     */
    public sendToGlobal(data: string | string[]) {
        return this.sendTo('', data);
    }

    /**
     * Sends private message
     * @param user The user
     * @param data The message(s)
     */
    public pm(user: string, data: string | string[]) {
        if (!(data instanceof Array)) {
            data = [data.toString()];
        }
        for (let i = 0; i < data.length; i++) {
            data[i] = ('|/msg ' + toId(user) + "," + data[i]);
        }
        return this.send(data);
    }

    /**
     * Sends the '/cmd rooms' command
     * The server will return a query response containing the list of rooms
     * Listen for the 'rooms' event to get the result
     */
    public queryRooms() {
        this.sendToGlobal('/cmd rooms');
    }

    /**
     * Joins a room
     * @param room The room to join
     * @param silent True if you do not want the server to send an error reply
     */
    public joinRoom(room: string, silent?: boolean) {
        if (silent) {
            this.sendToGlobal("/noreply /join " + room);
        } else {
            this.sendToGlobal("/join " + room);
        }
    }

    /**
     * Leaves a room
     * @param room The room to leave
     * @param silent True if you do not want the server to send an error reply
     */
    public leaveRoom(room: string, silent?: boolean) {
        if (silent) {
            this.sendToGlobal("/noreply /join " + room);
        } else {
            this.sendToGlobal("/join " + room);
        }
    }

    /**
     * Receives a message
     * @param msg The message
     */
    private receive(msg: string) {
        this.receiveMsg(msg);
    }

    /**
     * Receives parsed messages
     * @param msg The parsed message
     */
    private receiveMsg(msg: string) {
        if (!msg) return;
        if (msg.includes('\n')) {
            const lines = msg.split('\n');
            let room = Default_Room;
            let firstLine = 0;
            if (lines[0].charAt(0) === '>') {
                room = lines[0].substr(1) || Default_Room;
                firstLine = 1;
            }
            for (let i = firstLine; i < lines.length; i++) {
                if (lines[i].split('|')[1] === 'init') {
                    for (let j = i; j < lines.length; j++) {
                        this.parseLine(room, lines[j], true);
                    }
                    break;
                } else {
                    this.parseLine(room, lines[i], false);
                }
            }
        } else {
            this.parseLine(Default_Room, msg, false);
        }
    }

    /**
     * Parses line, running corresponding events
     * @param room The room
     * @param line The line
     * @param initialMsg True if it's initial message
     */
    private parseLine(room, line, initialMsg) {
        const splittedLine = line.substr(1).split('|');

        switch (splittedLine[0]) {
            case 'challstr':
                this.challengeString = {
                    id: splittedLine[1],
                    str: splittedLine[2],
                };
                this.emit("can-login");
                break;
            case 'updateuser':
                {
                    const oldNick = this.status.nick;
                    this.status.isGuest = !parseInt(splittedLine[2]);
                    if (splittedLine[1] && splittedLine[1].endsWith("@!")) {
                        this.status.nick = splittedLine[1].substr(0, splittedLine[1].length - 2);
                        this.status.away = true;
                    } else {
                        this.status.nick = splittedLine[1];
                        this.status.away = false;
                    }
                    if (toId(oldNick) !== toId(this.status.nick) && !this.status.isGuest) {
                        this.emit("renamed", this.status.nick);
                    }
                }
                break;
            case 'formats':
                {
                    const formats = parsePokemonShowdownFormats(splittedLine.slice(1).join("|"));
                    this.emit("formats", formats);
                }
                break;
            case 'queryresponse':
                {
                    const queryType = splittedLine[1] || "";
                    try {
                        const queryResult = JSON.parse(splittedLine.slice(2).join("|"));
                        this.emit("query-response", queryType, queryResult);

                        if (queryType === "rooms") {
                            this.emit("rooms", queryResult);
                        }
                    } catch (ex) {
                        this.emit("error", ex);
                    }
                }
                break;
            case 'popup':
                {
                    const msg = splittedLine.slice(1).join("|");
                    this.emit("popup", msg);
                }
                break;
            case 'init':
                {
                    const roomType = splittedLine[1] || "";
                    this.emit("room-join", room, roomType);
                }
                break;
            case 'title':
                {
                    const title = splittedLine.slice(1).join("|");
                    this.emit("room-title", room, title);
                }
                break;
            case 'users':
                {
                    const usersArray = splittedLine.slice(1).join("|").split(",");
                    this.emit("room-users", room, parseInt(usersArray[0], 10) || 0, usersArray.slice(1).map(parseUserIdentity));
                }
                break;
            case 'J':
            case 'j':
                {
                    this.emit("user-join", room, parseUserIdentity(splittedLine[1] || ""));
                }
                break;
            case 'L':
            case 'l':
                {
                    this.emit("user-leave", room, parseUserIdentity(splittedLine[1] || ""));
                }
                break;
            case 'n':
            case 'N':
                {
                    this.emit("user-rename", room, splittedLine[2] || "", parseUserIdentity(splittedLine[1] || ""));
                }
                break;
            case 'deinit':
                {
                    this.emit("room-leave", room);
                }
                break;
            case 'noinit':
                {
                    const code = splittedLine[1] || "";
                    if (splittedLine[1] === "rename") {
                        const newId = splittedLine[2] || "";
                        const newTitle = splittedLine.slice(3).join("|");
                        this.emit("room-rename", room, newId, newTitle);
                    } else {
                        const message = splittedLine.slice(2).join("|");
                        this.emit("room-join-failure", code, message);
                    }
                }
                break;
            case 'c':
                {
                    const userIdentity = parseUserIdentity(splittedLine[1] || "");
                    const message = parseChatMessage(splittedLine.slice(2).join("|"));

                    if (userIdentity.id === toId(this.status.nick)) {
                        this.emit("chat-echo", room, userIdentity, message);
                    } else {
                        this.emit("chat", room, userIdentity, message);
                    }
                }
                break;
            case 'c:':
                {
                    const serverTime = parseInt(splittedLine[1] || "") || 0;
                    const userIdentity = parseUserIdentity(splittedLine[2] || "");
                    const message = parseChatMessage(splittedLine.slice(3).join("|"));

                    if (userIdentity.id === toId(this.status.nick)) {
                        this.emit("chat-echo", room, userIdentity, message, serverTime);
                    } else {
                        this.emit("chat", room, userIdentity, message, serverTime);
                    }
                }
                break;
            case 'pm':
                {
                    const fromUser = parseUserIdentity(splittedLine[1] || "");
                    const toUser = parseUserIdentity(splittedLine[2] || "");
                    const message = parseChatMessage(splittedLine.slice(3).join("|"));

                    if (fromUser.id === toId(this.status.nick)) {
                        this.emit("pm-echo", fromUser, toUser, message);
                    } else {
                        this.emit("pm", fromUser, toUser, message);
                    }
                }
                break;
        }
        this.emit('line', room, line, splittedLine, initialMsg);
    }

    /**
     * Closes the connection and releases any allocated resources
     */
    public destroy() {
        this.disconnect();
    }
}
