# db assignment

# Installation & usage

This project is written in typescript, and runs in nodejs.

To get started:

1. Install nodejs (I dont really know what minimum version you need, I used 20.10.0)
2. Run `npm install`
3. Run the tests with `npm run test`
4. Run the "application" with `npm run cli`

# Assumptions:

1. Keys and values are only strings
2. Object/hashmaps/dictionaries/sets/etc are not considered databases
3. We don't actually care about concurrency/transaction management between
   sessions, just that we can hold temporary state correctly.
4. It is acceptable to duplicate key/values to make "indexes", even though
   it is not acceptable to duplicate the database for a transaction.
   1. It is acceptable for transactions to duplicate the things they have
      modified (e.g. records and correlated indexes), including doubling the
      size of memory if every row is mutated.
5. Example 4 should probably pass as well...
6. We dont actually need to serialize state or support storing data larger than
   available memory.
7. The runtime performance of _heavily_ nested transactions is not as critical
   as scaling with large datasets, e.g. handling 10000 nested transactions is
   vital than handling 10000 rows.
8. It is less critical to shrink the database when keys or values are removed
9. Set and Object lookups are O(1).
10. ... more to come ...

