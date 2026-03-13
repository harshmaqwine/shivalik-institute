module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const exists = await db.listCollections({ name: 'instituteassets' }, { nameOnly: true }).toArray();
    if (exists.length) {
      return;
    }

    await db.createCollection("instituteassets", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          properties: {
            assetNumber: {
              bsonType: "string",
            },
            assetType: {
              bsonType: "string",
            },
            assetName: {
              bsonType: "string",
            },
            status: {
              bsonType: "string",
            },
            createdBy: {
              bsonType: "objectId",
            },
            updatedBy: {
              bsonType: "objectId",
            },
            createdAt: {
              bsonType: "date",
            },
            updatedAt: {
              bsonType: "date",
            },
            deletedAt: {
              bsonType: "date",
            },
            isDeleted: {
              bsonType: "bool",
            },
          },
        },
      },
    });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const exists = await db.listCollections({ name: 'instituteassets' }, { nameOnly: true }).toArray();
    if (exists.length) {
      await db.collection('instituteassets').drop();
    }
  }
};
