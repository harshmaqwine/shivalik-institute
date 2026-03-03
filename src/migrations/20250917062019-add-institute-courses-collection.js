module.exports = {
  async up(db, client) {
    const exists = await db.listCollections({ name: 'institutecourses' }, { nameOnly: true }).toArray();
    if (exists.length) {
      return;
    }

    await db.createCollection("institutecourses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          properties: {
            name: {
              bsonType: "string",
            },
            status: {
              bsonType: "string",
            },
            price: {
                bsonType: "string",
            },
            discount: {
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

  async down(db, client) {
    const exists = await db.listCollections({ name: 'institutecourses' }, { nameOnly: true }).toArray();
    if (exists.length) {
      await db.collection('institutecourses').drop();
    }
  }
};
