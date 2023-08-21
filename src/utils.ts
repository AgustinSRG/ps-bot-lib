// Utility functions

"use strict";

import { UserIdentity } from "./models";

/**
 * Gets ID by name
 * @param str The name string
 * @returns The ID
 */
export function toId(str: unknown): string {
    if (!str) {
        return "";
    }
    return (str + "").toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Gets room ID by name
 * @param str The room name
 * @returns The room ID
 */
export function toRoomId(str: unknown): string {
    if (!str) {
        return "";
    }
    return (str + "").toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/**
 * Parses user identity
 * @param str The raw user identity
 * @returns The parsed user identity
 */
export function parseUserIdentity(str: string): UserIdentity {
    if (str.endsWith("@!")) {
        return {
            id: toId(str),
            name: str.substring(1, str.length - 2),
            group: str.charAt(0),
            away: true,
        };
    } else {
        return {
            id: toId(str),
            name: str.substring(1),
            group: str.charAt(0),
            away: false,
        };
    }
}
