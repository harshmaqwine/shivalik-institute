const path = require('path');
const migrateMongo = require('migrate-mongo');

/**
 * Executes pending migrate-mongo scripts for the current environment.
 *
 * @returns {Promise<void>} Resolves when all pending migrations are applied.
 */
async function runMigrations() {
  let client;
  try {
    const configPath = path.resolve(__dirname, 'migrate-mongo-config.js');
    migrateMongo.config.set({
      ...require(configPath)
    });

    const connection = await migrateMongo.database.connect();
    client = connection.client;

    const migrated = await migrateMongo.up(connection.db, connection.client);
    if (!migrated.length) {
      console.log('No pending migrations found.');
      return;
    }

    console.log('Applied migrations:');
    migrated.forEach((migrationName) => console.log(`- ${migrationName}`));
  } catch (error) {
    console.error('Migration execution failed:', error);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

runMigrations();
