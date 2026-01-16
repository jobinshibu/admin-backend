require('dotenv').config();
const db = require('./models');

async function check() {
    try {
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Database:', db.sequelize.config.database);
        await db.sequelize.authenticate();
        const tables = await db.sequelize.getQueryInterface().showAllTables();
        console.log(`Total tables found: ${tables.length}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
