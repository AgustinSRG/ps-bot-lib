// Any other interfaces go here

"use strict";

/**
 * Server room list
 */
export interface RoomsList {
    /**
     * List of chat rooms
     */
    chat: RoomsListCharRoomDetails[];

    /**
     * List of room sections
     */
    sectionTitles: string[];

    /**
     * Number of users connected to the server
     */
    userCount: number;

    /**
     * Number of active battles
     */
    battleCount: number;
}

/**
 * Details of a chat room
 */
export interface RoomsListCharRoomDetails {
    /**
     * Title of the room
     */
    title: string;

    /**
     * Description of the room
     */
    desc: string;

    /**
     * Number of users inside the chat room
     */
    userCount: number;

    /**
     * Name of the section the chat room belongs to
     */
    section: string;

    /**
     * List of sub-rooms
     */
    subRooms?: string[];
}

/**
 * Identity of an user
 */
export interface UserIdentity {
    /**
     * User ID
     */
    id: string;

    /**
     * User name
     */
    name: string;

    /**
     * User group, usually a single character
     * Examples: +,%,@,#,&
     */
    group: string;

    /**
     * True if the user is away
     * This means the user didn't interact with
     * the server for several minutes
     */
    away: boolean;
}
