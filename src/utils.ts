// Utility functions

"use strict";

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
