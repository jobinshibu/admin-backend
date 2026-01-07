const db = require("./models");

async function listTables() {
    try {
        await db.sequelize.authenticate();
        const tables = await db.sequelize.getQueryInterface().showAllTables();
        console.log("Current Tables in Database:");
        console.log(tables);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listTables();
