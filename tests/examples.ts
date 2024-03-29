import { describe, expect, test } from '@jest/globals';
import { AssignmentDB } from '../src/database';

describe('devoted tech assignment', () => {
    test('example 1 test', () => {
        // This test is ripped from the original document and exercises the database API, not the CLI.
        const db = new AssignmentDB();
        // >> GET a
        // NULL
        expect(db.get("a")).toBeUndefined();

        // >> SET a foo
        expect(db.set("a", "foo")).toEqual("foo");

        // >> SET b foo
        expect(db.set("b", "foo")).toEqual("foo");

        // >> COUNT foo
        // 2
        expect(db.count("foo")).toEqual(2);

        // >> COUNT bar
        // 0
        expect(db.count("bar")).toEqual(0);

        // >> DELETE a
        expect(db.delete("a")).toEqual("foo");

        // >> COUNT foo
        // 1
        expect(db.count("foo")).toEqual(1);

        // >> SET b baz
        expect(db.set("b", "baz")).toEqual("baz");

        // >> COUNT foo
        // 0
        expect(db.count("foo")).toEqual(0);

        // >> GET b
        // baz
        expect(db.get("b")).toEqual("baz");

        // >> GET B
        // NULL
        expect(db.get("B")).toBeUndefined();
        // >> END
    });
});
