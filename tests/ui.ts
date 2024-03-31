import { describe, expect, test } from '@jest/globals';
import { AssignmentDB } from '../src/database';
import { main } from '../src/cli';
import { PassThrough } from 'stream';
import { stdin as mockStdIn, MockSTDIN } from 'mock-stdin';

async function inputs(stdin: MockSTDIN, inputs: string[]): Promise<void> {
    for (const i of inputs) {
        await new Promise(process.nextTick);
        stdin.send(`${i}\n`);
    }
}

async function readAll(stream: PassThrough): Promise<string> {
    let b = Buffer.from([]);
    for await (const chunk of stream) {
        b = Buffer.concat([b, chunk]);
    }
    return b.toString();
}

async function drive_ui(data: string[]): Promise<{ db: AssignmentDB, output: string }> {
    const db = new AssignmentDB();
    const stdin = mockStdIn();
    const stdout = new PassThrough();
    const app = main(db, process.stdin, stdout);
    await inputs(stdin, data);
    await app;
    const output = await readAll(stdout);
    return { db, output };
}

describe("UI", () => {
    test("basic set/get inputs", async () => {
        const { db, output } = await drive_ui([
            "SET 1 1234",
            "GET 1",
            "END",
        ]);

        expect(db.get('1')).toEqual('1234');
        expect(output).toMatchSnapshot();
    });

    test("count basics", async () => {
        const { db, output } = await drive_ui([
            "SET 1 1234",
            "COUNT 1234",
            "COUNT 123",
            "SET 2 1234",
            "COUNT 1234",
            "END",
        ]);

        expect(db.get('1')).toEqual('1234');
        expect(output).toMatchSnapshot();
    });

    test("invalid commands", async () => {
        const { output } = await drive_ui([
            "hello",
            "HELLO",
            "GET",
            // disallow spaces in keys
            "GET a a",
            "SET",
            "SET X",
            // disallow spaces in values (or keys)
            "SET X a a",
            "DELETE",
            "END",
        ]);

        expect(output).toMatchSnapshot();
    });

    test("commit", async () => {
        const { db, output } = await drive_ui([
            "COMMIT",
            "SET 1 1234",
            "BEGIN",
            "GET 1",
            "SET 1 123",
            "BEGIN",
            "SET 1 abc",
            "COMMIT",
            "GET 1",
            "ROLLBACK",
            "END",
        ]);

        expect(db.get('1')).toEqual('abc');
        expect(output).toMatchSnapshot();

    })

    test("basic rollback UI", async () => {
        const { db, output } = await drive_ui([
            "ROLLBACK",
            "SET 1 1234",
            "BEGIN",
            "GET 1",
            "SET 1 123",
            "GET 1",
            "ROLLBACK",
            "GET 1",
            "END",
        ]);

        expect(db.get('1')).toEqual('1234');
        expect(output).toMatchSnapshot();
    });

    test("delete", async () => {
        const { db, output } = await drive_ui([
            "SET 1 1234",
            "GET 1",
            "DELETE 1",
            "GET 1",
            "END",
        ]);

        expect(db.get('1')).toBeUndefined()
        expect(output).toMatchSnapshot();
    });
});
