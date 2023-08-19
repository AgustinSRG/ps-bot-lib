// Utility functions test

"use strict";

import assert from "assert";

import { toId, toRoomId } from "../src/utils";

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
});

