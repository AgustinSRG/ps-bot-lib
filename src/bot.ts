// Pokemon showdown bot

'use strict';

import { EventEmitter } from "events";
import SockJS from 'sockjs-client';
import Https from 'https';
import { toId } from "./utils";
import { PokemonShowdownBotConfig } from "./config";

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
     *  - splittedLine: Line splitted by "|". The initial "|"" is skipped, so splittedLine[0] is the message type
     *  - initialMsg: True if it's a room initial message
     */
    on(event: 'line', handler: (room: string, line: string, splittedLine: string[], initialMsg: boolean) => void): this;
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
    public getConnectionUrl(): string {
        return `${this.config.secure ? 'https' : 'http'}://${this.config.host}:${this.config.port}/showdown/`;
    }

    /**
     * Gets the login URL
     * @returns The login URL
     */
    public getLoginUrl(): string {
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
     * 
     * @param delay The delay (ms)
     */
    public retryConnect(delay: number) {
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
     * @param {Number} delay
     * @param {String} nick
     * @param {String} pass - Passowrd if needed
     */
    public retryRename(delay: number, nick: string, pass?: string) {
        if (this.loginRetryTimer) {
            clearTimeout(this.loginRetryTimer);
            this.loginRetryTimer = null;
        }
        this.loginRetryTimer = setTimeout(function () {
            this.rename(nick, pass);
        }.bind(this), delay);
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
        }
        this.emit('line', room, line, splittedLine, initialMsg);
    }

    destroy() {
        this.disconnect();
    }
}
