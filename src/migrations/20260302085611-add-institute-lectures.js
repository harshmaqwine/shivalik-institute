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
          required: ["courseId", "classroomNumber", "lectureDate"],
          properties: {

            courseId: {
              bsonType: "objectId",
              description: "Course reference"
            },

            subCourseId: {
              bsonType: ["objectId", "null"]
            },

            batchId: {
              bsonType: ["objectId", "null"]
            },

            moduleId: {
              bsonType: ["objectId", "null"]
            },

            classroomNumber: {
              bsonType: "string"
            },

            lectureDate: {
              bsonType: "date"
            },

            details: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["topic", "lectureType", "sessionStartTime", "sessionEndTime"],
                properties: {

                  expertId: {
                    bsonType: ["objectId", "null"]
                  },

                  topic: {
                    bsonType: "string"
                  },

                  lectureType: {
                    enum: ["Guest", "Module", "Site Visit", "Master Class"]
                  },

                  sessionStartTime: {
                    bsonType: "string"
                  },

                  sessionEndTime: {
                    bsonType: "string"
                  }

                }
              }
            },

            material: {
              bsonType: ["string", "null"]
            },

            createFeedbackForLearner: {
              bsonType: "bool"
            },

            feedbackForCoordinator: {
              bsonType: ["string", "null"]
            },

            projectReviewLecture: {
              bsonType: "bool"
            },

            juryLecture: {
              bsonType: "bool"
            },

            moduleFinished: {
              bsonType: "bool"
            },

            submissionRequired: {
              bsonType: "bool"
            },

            notifyStudents: {
              bsonType: "bool"
            },

            status: {
              bsonType: "string"
            },

            isDeleted: {
              bsonType: "bool"
            },

            createdBy: {
              bsonType: ["objectId", "null"]
            },

            updatedBy: {
              bsonType: ["objectId", "null"]
            },

            createdAt: {
              bsonType: "date"
            },

            updatedAt: {
              bsonType: "date"
            },

            deletedAt: {
              bsonType: ["date", "null"]
            }

          }
        }
      }
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
