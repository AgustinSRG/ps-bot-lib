// Utility functions test

"use strict";

import assert from "assert";

import { parseUserIdentity, toId, toRoomId } from "../src/utils";
import { UserIdentity } from "../src/models";

describe("Utilities", () => {
    it("toId", async () => {
        const testCases: { input: unknown, expected: string }[] = [
            { input: undefined, expected: "" },
            { input: null, expected: "" },
            { input: 2, expected: "2" },
            { input: "Example", expected: "example" },
            { input: "Example2", expected: "example2" },
            { input: "[%&//Example-3 ++", expected: "example3" },
        ];

        for (let test of testCases) {
            assert.equal(toId(test.input), test.expected);
        }
    });

    it("toRoomId", async () => {
        const testCases: { input: unknown, expected: string }[] = [
            { input: undefined, expected: "" },
            { input: null, expected: "" },
            { input: 2, expected: "2" },
            { input: "Example", expected: "example" },
            { input: "Example2", expected: "example2" },
            { input: "[%&//Example-3 ++", expected: "example-3" },
        ];

        for (let test of testCases) {
            assert.equal(toRoomId(test.input), test.expected);
        }
    });

    it("parseUserIdentity", async () => {
        const testCases: { input: string, expected: UserIdentity }[] = [
            { input: " User", expected: { id: "user", name: "User", group: ' ', away: false } },
            { input: "+User", expected: { id: "user", name: "User", group: '+', away: false } },
            { input: " User@!", expected: { id: "user", name: "User", group: ' ', away: true } },
            { input: "%User@!", expected: { id: "user", name: "User", group: '%', away: true } },
            { input: "&User-Admin", expected: { id: "useradmin", name: "User-Admin", group: '&', away: false } },
        ];

        for (let test of testCases) {
            assert.deepEqual(parseUserIdentity(test.input), test.expected);
        }
    });
});

