import { describe, expect, test } from '@jest/globals';
import { AssignmentDB, Transaction } from '../src/database';

// These tests are ripped from the original document and exercise
// the database API, not the CLI.
describe('devoted tech assignment', () => {
    test('example 1', () => {
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

    test('example 2', () => {
        const db = new AssignmentDB();
        // >> SET a foo
        expect(db.set("a", "foo")).toEqual("foo");
        // >> SET a foo
        expect(db.set("a", "foo")).toEqual("foo");
        // >> COUNT foo
        // 1
        expect(db.count("foo")).toEqual(1);
        // >> GET a
        // foo
        expect(db.get("a")).toEqual("foo");
        // >> DELETE a
        expect(db.delete("a")).toEqual("foo");
        // >> GET a
        // NULL
        expect(db.get("a")).toBeUndefined();
        // >> COUNT foo
        // 0
        expect(db.count("a")).toEqual(0);
        // >> END
    });

    test('example 3', () => {
        const db = new AssignmentDB();

        // >> BEGIN
        const initial_transaction = db.begin();
        expect(initial_transaction.parent).not.toBeNull();
        let active_transaction: Transaction | null = initial_transaction;

        // >> SET a foo
        expect(db.set('a', 'foo')).toEqual('foo');

        // >> GET a
        // foo
        expect(db.get('a')).toEqual('foo');

        // >> BEGIN
        active_transaction = db.begin();
        expect(active_transaction).not.toEqual(initial_transaction);
        expect(active_transaction.parent).toEqual(initial_transaction);

        // >> SET a bar
        expect(db.set('a', 'bar')).toEqual('bar');

        // >> GET a
        // bar
        expect(db.get('a')).toEqual('bar');

        // >> SET a baz
        expect(db.set('a', 'baz')).toEqual('baz');

        // >> ROLLBACK
        active_transaction = db.rollback();
        expect(active_transaction).toEqual(initial_transaction);

        // >> GET a
        // foo
        expect(db.get('a')).toEqual('foo');

        // >> ROLLBACK
        expect(db.rollback()).not.toBeNull();
        expect(db.active_tx.parent).toBeNull();

        // >> GET a
        // NULL
        expect(db.get('a')).toBeUndefined();
        // >> END
    });

    test('example 4', () => {
        const db = new AssignmentDB();
        // >> SET a foo
        expect(db.set('a', 'foo')).toEqual('foo');

        // >> SET b baz
        expect(db.set('b', 'baz')).toEqual('baz');

        // >> BEGIN
        let active_transaction: Transaction = db.begin();
        expect(Object.keys(active_transaction.data)).toHaveLength(0);
        expect(Object.keys(active_transaction.value_index)).toHaveLength(0);

        // >> GET a
        // foo
        expect(db.get('a')).toEqual('foo');

        // >> SET a bar
        expect(db.set('a', 'bar')).toEqual('bar');

        // >> COUNT bar
        // 1
        expect(db.count('bar')).toEqual(1);

        // >> BEGIN
        db.begin();
        expect(Object.keys(db.active_tx.data)).toHaveLength(0);
        expect(Object.keys(db.active_tx.parent?.data || {})).toHaveLength(1);

        // >> COUNT bar
        // 1
        expect(db.count('bar')).toEqual(1);

        // >> DELETE a
        expect(db.delete('a')).toEqual('bar');

        // >> GET a
        // NULL
        expect(db.get('a')).toBeUndefined();

        // >> COUNT bar
        // 0
        expect(db.count('bar')).toEqual(0);

        // >> ROLLBACK
        expect(db.rollback()).not.toBeNull();
        expect(db.active_tx).not.toBeNull();
        expect(db.active_tx.parent).not.toBeNull();
        expect(db.active_tx.parent?.parent).toBeNull();

        // >> GET a
        // bar
        expect(db.get('a')).toEqual('bar');

        // >> COUNT bar
        // 1
        expect(db.count('bar')).toEqual(1);

        // >> COMMIT
        db.commit();
        expect(db.active_tx).not.toBeNull();
        expect(db.active_tx.parent).toBeNull();

        // >> GET a
        // bar
        expect(db.get('a')).toEqual('bar');

        // >> GET b
        // baz
        expect(db.get('b')).toEqual('baz');

        // >> END
    });
});
