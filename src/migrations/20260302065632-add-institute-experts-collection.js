module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const exists = await db.listCollections({ name: 'instituteexperts' }, { nameOnly: true }).toArray();
    if (exists.length) {
      return;
    }

    await db.createCollection("instituteexperts", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          properties: {
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
            contactNo: {
              bsonType: "string"
            },
            gender: {
              bsonType: "string"
            },
            dateOfBirth: {
              bsonType: "string"
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
            familyBackground: {
              bsonType: "string"
            },
            highestEducation: {
              bsonType: "string"
            },
            collegeName: {
              bsonType: "string"
            },
            currentDesignation: {
              bsonType: "string"
            },
            teachingExperience: {
              bsonType: "int"
            },
            industrialExperience: {
              bsonType: "int"
            },
            motivationToJoin: {
              bsonType: "string"
            },
            linkedinProfileLink: {
              bsonType: "string"
            },
            facebookProfileLink: {
              bsonType: "string"
            },
            perHourRate: {
              bsonType: "int"
            },
            bankDetails: {
              bsonType: "object",
              properties: {
                bankName: {
                  bsonType: "string"
                },
                accountNumber: {
                  bsonType: "string"
                },
                ifscCode: {
                  bsonType: "string"
                }
              }
            },
            about: {
              bsonType: "string"
            },
            past: {
              bsonType: "string"
            },
            skills: {
              bsonType: "string"
            },
            education: {
              bsonType: "string"
            },
            alternateEmail: {
              bsonType: "string"
            },
            panCard: {
              bsonType: "string"
            },
            profilePicture: {
              bsonType: "string"
            },
            isCoordinator: {
              bsonType: "bool"
            },
            specialization: {
              bsonType: "string"
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
      const exists = await db.listCollections({ name: 'instituteexperts' }, { nameOnly: true }).toArray();
      if (exists.length) {
        await db.collection('instituteexperts').drop();
      }
    }
  };

