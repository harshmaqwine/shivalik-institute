module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const exists = await db.listCollections({ name: 'institutelectures' }, { nameOnly: true }).toArray();
    if (exists.length) {
      return;
    }

    await db.createCollection("institutelectures", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          properties: {
            lectureName: {
              bsonType: "string",
            },
            lectureDate: {
              bsonType: "date",
            },
            lectureDescription: {
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
    const exists = await db.listCollections({ name: 'institutelectures' }, { nameOnly: true }).toArray();
    if (exists.length) {
      await db.collection('institutelectures').drop();
    }
  }
};
