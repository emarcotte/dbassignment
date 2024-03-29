/**
 * An extremely "poor-mans" database that is should never see the light
 * of day. This database acts like a simple stringy-key-value store.
 *
 * Note:
 *
 * 1. Nothing is "nullable", absence in the database is expressed with `undefined`.
 * 2. The CLI renders absence of value as "NULL", which is not visual 
 *    distinct from a string with the same value.
 */
export class AssignmentDB {
    data: Record<string, string>;

    constructor() {
        this.data = {}
    }

    get(key: string): string | undefined {
        return this.data[key];
    }

    set(key: string, value: string): string {
        return this.data[key] = value;
    }

    count(search_value: string): number {
        // TODO: Does this need an "index"?
        return Object.values(this.data).reduce(
            (count, stored_value) => {
                if (stored_value == search_value) {
                    return count + 1;
                }
                return count;
            },
            0
        );
    }

    delete(key: string): string | undefined {
        const val = this.data[key];
        delete this.data[key];
        return val;
    }
}
