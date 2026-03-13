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
            courseId: { 
              bsonType: "objectId" 
            },
            subCourseId: { 
              bsonType: "objectId" 
            },
            batchId: { 
              bsonType: "objectId" 
            },
            expertId: { 
              bsonType: "objectId" 
            },
            classroomNumber: { 
              bsonType: "string" 
            },
            lectureDate: { 
              bsonType: "date" 
            },
            lectureType: { 
              bsonType: "string" 
            },
            projectReviewLecture: { 
              bsonType: "bool" 
            },
            sessionStartTime: { 
              bsonType: "string" 
            },
            sessionEndTime: { 
              bsonType: "string" 
            },
            material: { 
              bsonType: "string" 
            },
            createFeedbackForLearner:  { 
              bsonType: "bool" 
            },
            feedbackForCoordinator: { 
              bsonType: "string" 
            },
            status: { 
              bsonType: "string" 
            },
            isDeleted:  { 
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
    const exists = await db.listCollections({ name: 'institutelectures' }, { nameOnly: true }).toArray();
    if (exists.length) {
      await db.collection('institutelectures').drop();
    }
  }
};