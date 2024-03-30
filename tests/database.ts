import { describe, expect, test } from '@jest/globals';
import { AssignmentDB } from '../src/database';

describe('rollback', () => {
    test('top level returns null', () => {
        const db = new AssignmentDB();
        expect(db.rollback()).toBeNull();
    });
});

describe('commit', () => {
    test('top level returns null', () => {
        const db = new AssignmentDB();
        expect(db.rollback()).toBeNull();
    });

    test('rolls up all nesting', () => {
        const db = new AssignmentDB();
        db.begin();
        db.set('a', '1');
        db.begin();
        db.set('a', '2');
        db.begin();
        db.set('a', '3');
        db.commit();
        expect(db.active_tx.parent).toBeNull();
        expect(db.get('a')).toEqual('3');
    });

    test('rolls up after rollback', () => {
        const db = new AssignmentDB();
        db.begin();
        db.set('a', '1');
        db.begin();
        db.set('a', '2');
        db.begin();
        db.set('a', '3');
        db.rollback();
        db.commit();
        expect(db.active_tx.parent).toBeNull();
        expect(db.get('a')).toEqual('2');
    });
});

