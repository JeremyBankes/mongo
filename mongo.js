const { MongoClient } = require('mongodb');

/** @type {MongoClient} */
let client = null;

const database = {

    async start(uri) {
        client = new MongoClient(uri);
        await client.connect();
    },

    client() {
        return client;
    },

    /**
     * Creates a mongo Db instance for database interactions
     * @param {string} [databaseName] 
     * @returns 
     */
    open(databaseName) {
        return database.client().db(databaseName);
    },

    async stop() {
        await client.close();
    },

    pipeline: {

        /**
         * @param {string} foreignCollection 
         * @param {string} foreignField 
         * @param {string} localField 
         * @param {string} as 
         * @param {Object.<string, number>} [projection] 
         * @returns An array of pipeline stages required to perform a lookup (with an optional projection)
         */
        lookup(foreignCollection, foreignField, localField, as, projection = null) {
            const pipeline = [{ $match: { $expr: { $eq: ['$' + foreignField, '$$localField'] } } }];
            if (projection !== null) pipeline.push({ $project: projection });
            return [
                { $lookup: { as, from: foreignCollection, let: { localField: '$' + localField }, pipeline } },
                { $unwind: { path: '$' + as, preserveNullAndEmptyArrays: true } }
            ];
        },

        /**
         * @param {string} query 
         * @param {string[]} fields An array of fields to search for 'query' in (No $)
         * @returns An array of pipeline stages required to perform a regex search
         */
        search(query, fields) {
            return [
                { $set: { searchText: { $concat: fields.flatMap((field) => ([{ $toString: `$${field}` }, ' '])) } } },
                { $match: { searchText: new RegExp(`.*${query}.*`, 'i') } },
                { $unset: 'searchText' }
            ];
        },

        /**
         * @param {Date} fromTime Inclusive
         * @param {Date} toTime Exclusive
         * @param {string} dateField The name of the field containing a Date
         * @returns An array of pipeline stages required to perform a date filter
         */
        between(fromTime, toTime, dateField) {
            return [{ $match: { [dateField]: { $gte: fromTime, $lt: toTime } } }];
        }

    }

};

module.exports = database;