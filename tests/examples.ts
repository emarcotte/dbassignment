import { describe, expect, test } from '@jest/globals';

describe('devoted tech assignment', () => {
    test('example 1 test', () => {
        // This test is ripped from the original document and exercises the database API, not the CLI.
        // >> GET a
        // NULL 
        // >> SET a foo
        // >> SET b foo
        // >> COUNT foo
        // 2
        // >> COUNT bar
        // 0
        // >> DELETE a
        // >> COUNT foo
        // 1
        // >> SET b baz
        // >> COUNT foo
        // 0
        // >> GET b
        // baz
        // >> GET B
        // NULL
        // >> END


        const db = new AssignmentDB();
        expect(db.get("a")).toBeNull();
    });
});
