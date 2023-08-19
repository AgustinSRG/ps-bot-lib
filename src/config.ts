// Pokemon Showdown bot config

"use strict";

/**
 * Pokemon Showdown bot config
 */
export interface PokemonShowdownBotConfig {
    /**
     * Server hostname
     */
    host: string;

    /**
     * Server port
     */
    port: number;

    /**
     * True to use secure connection
     */
    secure: boolean;

    /**
     * Login server URL
     * Default: play.pokemonshowdown.com
     */
    loginServer?: string;

    /**
     * Server ID for the login server
     * Eg: showdown
     */
    serverId: string;

    /**
     * Max number of lines the bot can send at a time
     * This a server restriction
     * By default is 3
     */
    maxLinesSend?: number;

    /**
     * Retry connection if the bot disconnects?
     * Default true
     */
    connectionRetry?: boolean;

    /**
     * Delay to retry the connection (milliseconds)
     * By default 10 seconds
     */
    connectionRetryDelay?: number;

    /**
     * Length of the message buffer
     * This buffer is used to send messages
     * By default, 6 messages
     */
    sendBufferMaxLength?: number;

    /**
     * Milliseconds to wait after sending a message batch
     * By default 200 milliseconds
     */
    chatThrottleDelay?: number;
}
