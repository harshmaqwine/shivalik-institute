module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("institutestudents").updateMany(
      {},
      {
        $set: {
          subCourseId: null,
          countryCode: "+91",
          countryCodeName: "IN",
        }
      },
      { bypassDocumentValidation: true }
    );

    await db.command({
      collMod: "institutestudents", // MModify the existing collection
      validator: {
        $jsonSchema: {
          bsonType: "object",
          properties: {
            courseId: {
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
            },
            subCourseId: {
              bsonType: ["objectId", "null"]
            },
            countryCode: {
              bsonType: "string",
            },
            countryCodeName: {
              bsonType: "string",
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
    await db.collection("institutestudents").updateMany(
      {},
      {
        $unset: {
          subCourseId: "",
          countryCode: "",
          countryCodeName: ""
        }
      },
      { bypassDocumentValidation: true }
    );
    await db.command({
      collMod: "institutestudents",
      validator: {} // Reset to no validation
    });
  }
};