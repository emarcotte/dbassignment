type Key = string;
type Value = string;


/**
 * Transactions are used to hold data. They're layered together to implement nested transactions.
 * The transactions attempt to model a "copy-on-write" model.
 */
export class Transaction {
    /**
     * Parent transaction to use when fetching or setting data. Will be null
     * for the root transaction.
     */
    parent: Transaction | null;

    /**
     * `null` in a transaction indicates that this transaction deleted the key.
     */
    data: Record<Key, Value | null>;

    /**
     * An "index" of the values from the data table. Each value is mapped back to
     * the keys that matched it.
     */
    value_index: Record<Value, Set<Key>>;

    constructor(parent: Transaction | null) {
        this.parent = parent;
        this.data = {};
        this.value_index = {};
    }

    get(key: Key): Value | undefined {
        const value = this.data[key];

        if (value === undefined) {
            if (this.parent == null) {
                return undefined;
            }
            return this.parent.get(key);
        }

        if (value === null) {
            return undefined;
        }
        return value;
    }

    set(key: Key, value: Value): Value {
        const old_value = this.get(key);
        if (old_value != undefined) {
            this.cow_index(old_value).delete(key);
        }

        this.cow_index(value).add(key);
        return this.data[key] = value;
    }

    keys_by_value(search_value: Value): Set<Key> {
        const keys = this.value_index[search_value];
        if (keys) {
            return keys;
        }
        if (this.parent) {
            return this.parent.keys_by_value(search_value);
        }
        return new Set();
    }

    /**
     * Ensures the given index exists on this transaction when we need to write to it.
     */
    cow_index(value: Value): Set<Key> {
        if (this.value_index[value] != undefined) {
            return this.value_index[value];
        }
        if (this.parent) {
            // deeply nested transactions do have 
            return this.value_index[value] = new Set(this.parent.cow_index(value));
        }
        return this.value_index[value] = new Set();
    }

    delete(key: Key): Value | undefined {
        const tx_value = this.data[key];
        const inner_value = this.get(key);

        const index_to_mutate = tx_value || inner_value;

        if (index_to_mutate) {
            this.cow_index(index_to_mutate).delete(key);
        }
        this.data[key] = null;
        return index_to_mutate;
    }

    commit(): Transaction {
        if (!this.parent) {
            return this;
        }

        const parent = this.parent;

        Object.keys(this.value_index).forEach(v => {
            parent.value_index[v] = this.value_index[v];
        });

        Object.keys(this.data).forEach(k => {
            parent.data[k] = this.data[k];
        });

        return parent.commit();
    }
}

/**
 * An extremely "poor-mans" database that is should never see the light
 * of day. This database acts like a simple stringy-key-value store.
 *
 * This database implements the "read my own data" style of transaction where uncommitted
 * transaction state is visible to the client.
 *
 * Note:
 *
 * 1. Nothing is "nullable", absence in the database is expressed with `undefined`.
 * 2. The CLI renders absence of value as "NULL", which is not visual 
 *    distinct from a string with the same value.
 * 3. "committed" data lives in a root transaction, and it s not persisted to disk.
 * 4. Open, uncommitted transactions are layered on top of the root transaction to model
 *    nested transactions. They're merged into their parent on commit.
 */
export class AssignmentDB {
    active_tx: Transaction;

    constructor() {
        this.active_tx = new Transaction(null);
    }

    get(key: Key): Value | undefined {
        return this.active_tx.get(key);
    }

    set(key: Key, value: Value): Value {
        return this.active_tx.set(key, value);
    }

    count(search_value: Key): number {
        return this.active_tx.keys_by_value(search_value).size;
    }

    delete(key: Key): Value | undefined {
        return this.active_tx.delete(key);
    }

    begin(): Transaction {
        this.active_tx = new Transaction(this.active_tx);
        return this.active_tx;
    }

    rollback(): Transaction | null {
        if (this.active_tx.parent) {
            this.active_tx = this.active_tx.parent;
            return this.active_tx;
        }
        return null;
    }

    commit() {
        this.active_tx = this.active_tx.commit();
    }
}
