import { AssignmentDB } from "./database";
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import events from 'events';

const command_regex = /^([A-Z]+)(.*)/;
const set_args = /^([^\s]+)\s([^\s]+)$/;
const get_args = /^([^\s]+)$/;
const delete_args = /^([^\s]+)$/;

const handlers: Record<string, (db: AssignmentDB, args: string, output: NodeJS.WritableStream) => boolean> = {
    SET: set_handler,
    GET: get_handler,
    COUNT: count_handler,
    DELETE: delete_handler,
    BEGIN: begin_handler,
    ROLLBACK: rollback_handler,
    COMMIT: commit_handler,
    END: end_handler,
}

function end_handler(): boolean {
    return true;
}

function count_handler(db: AssignmentDB, value: string, output: NodeJS.WritableStream): boolean {
    const count = db.count(value)
    output.write(`${count}\n`);
    return false;
}

function delete_handler(db: AssignmentDB, args: string, output: NodeJS.WritableStream): boolean {
    const match = delete_args.exec(args);
    if (!match) {
        output.write("Invalid DELETE\n");
    }
    else {
        db.delete(match[1]);
    }
    return false;
}

function commit_handler(db: AssignmentDB): boolean {
    db.commit();
    return false;
}

function begin_handler(db: AssignmentDB): boolean {
    db.begin();
    return false;
}

function rollback_handler(db: AssignmentDB, _: string, output: NodeJS.WritableStream): boolean {
    const t = db.rollback();
    if (!t) {
        output.write("TRANSACTION NOT FOUND\n");
    }
    return false;
}

function get_handler(db: AssignmentDB, args: string, output: NodeJS.WritableStream): boolean {
    const match = get_args.exec(args);
    if (!match) {
        output.write("Invalid GET\n");
    }
    else {
        const v = db.get(match[1]);
        if (v === undefined) {
            output.write(`NULL\n`);
        }
        else {
            output.write(`${v}\n`);
        }
    }

    return false;
}

function set_handler(db: AssignmentDB, args: string, output: NodeJS.WritableStream): boolean {
    const match = set_args.exec(args);
    if (!match) {
        output.write("Invalid SET\n");
    }
    else {
        db.set(match[1], match[2]);
    }
    return false;
}

export async function main(
    db: AssignmentDB,
    input: NodeJS.ReadableStream,
    output: NodeJS.WritableStream,
) {
    const ui = readline.createInterface({
        input,
        output,
        prompt: '>> ',
    });
    ui.prompt();

    await Promise.race([
        // If the stdin is closed, see ya later.
        events.once(ui, 'close'),
        // Otherwise, just keep running the line parser
        new Promise<void>((resolve) => {
            ui.on('line', (line) => {
                const match = command_regex.exec(line);
                if (!match) {
                    output.write(`dont know what to do with ${line}\n`);
                }
                else {
                    const args = (match[2] || "").trim();
                    const handler = handlers[match[1]];
                    if (!handler) {
                        output.write(`Invalid command ${match[1]}\n`)
                    }
                    else {
                        if (handler(db, args, output)) {
                            resolve()
                        }
                    }
                }
                ui.prompt();
            });
        }),
    ]);


    ui.close();
    output.end();
}

if (require.main === module) {
    main(new AssignmentDB(), stdin, stdout);
}
