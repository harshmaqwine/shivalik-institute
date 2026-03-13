module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const exists = await db.listCollections({ name: 'institutestudents' }, { nameOnly: true }).toArray();
    if (exists.length) {
      return;
    }

    await db.createCollection("institutestudents", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          properties: {
            CourseId: {
              bsonType: "objectId"
            },
            batchId: {
              bsonType: "objectId"
            },
            prefixName: {
              bsonType: "string"
            },
            firstName: {
              bsonType: "string"
            },
            lastName: {
              bsonType: "string"
            },
            email: {
              bsonType: "string"
            },
            countryCode: {
              bsonType: "string"
            },
            countryName: {
              bsonType: "string"
            },
            phone: {
              bsonType: "string"
            },
            alternatePhone: {
              bsonType: "string"
            },
            enrollmentNo: {
              bsonType: "string"
            },
            gender: {
              bsonType: "string"
            },
            dateOfBirth: {
              bsonType: "date"
            },
            age: {
              bsonType: "int"
            },
            state: {
              bsonType: "string"
            },
            city: {
              bsonType: "string"
            },
            highestEducation: {
              bsonType: "string"
            },
            currentDesignation: {
              bsonType: "string"
            },
            yearsOfExperienceRealEstate: { 
              bsonType: "int" 
            },
            courseStartDate: { 
              bsonType: "date" 
            },
            enrolledBy: { 
              bsonType: "objectId" 
            },
            holdingSeat: { 
              bsonType: "bool" 
            },
            enrolledCourse: { 
              bsonType: "bool" 
            },
            documentsSubmitted: {
              bsonType: "object",
              properties: {
                aadharCard: { 
                  bsonType: "string" 
                },
                receipt: { 
                  bsonType: "string" 
                },
                photo: { 
                  bsonType: "string" 
                }
              }
            },
            profilePicture: { 
              bsonType: "string" 
            },
            isCoordinator: { 
              bsonType: "bool" 
            },
            status: { 
              bsonType: "string" 
            },
            isDeleted: { 
              bsonType: "bool" 
            },
            createdBy: { 
              bsonType: "objectId" 
            },
            updatedBy: { 
              bsonType: "objectId" 
            },
            createdAt: { 
              bsonType: "date" 
            },
            updatedAt: { 
              bsonType: "date" 
            },
            deletedAt: { 
              bsonType: "date" 
            }
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
    const exists = await db.listCollections({ name: 'institutestudents' }, { nameOnly: true }).toArray();
    if (exists.length) {
      await db.collection('institutestudents').drop();
    }
  }
};
