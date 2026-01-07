const db = require("./models");

async function syncDB() {
    try {
        console.log("Starting Database Sync...");
        await db.sequelize.authenticate();
        console.log("✓ Connection has been established successfully.");

        // sync({ alter: true }) will create tables if they don't exist and update them if they do.
        await db.sequelize.sync({ alter: true });
        console.log("✓ All models were synchronized successfully.");

        process.exit(0);
    } catch (error) {
        console.error("✗ Unable to connect to the database or sync models:");
        console.error(error);
        process.exit(1);
    }
}

syncDB();
