const db = require("./models");

async function syncDB() {
    try {
        console.log("Starting Database Sync...");
        await db.sequelize.authenticate();
        console.log("✓ Connection has been established successfully.");

        // PostgreSQL requires manual casting for type changes when data exists
        const columnsToFix = [
            { name: "healineVerified", from: "VARCHAR", to: "BOOLEAN" },
            { name: "recommended", from: "VARCHAR", to: "BOOLEAN" },
            { name: "topRated", from: "VARCHAR", to: "BOOLEAN" },
            { name: "active_status", from: "VARCHAR", to: "BOOLEAN" },
            { name: "is_24_by_7_working", from: "INTEGER", to: "BOOLEAN" }
        ];

        for (const col of columnsToFix) {
            try {
                console.log(`Checking/Fixing column ${col.name} in establishments...`);
                await db.sequelize.query(`
                    ALTER TABLE "establishments" 
                    ALTER COLUMN "${col.name}" DROP DEFAULT,
                    ALTER COLUMN "${col.name}" TYPE ${col.to} 
                    USING (
                        CASE 
                            WHEN "${col.name}"::text = '1' OR "${col.name}"::text = 'true' THEN true 
                            WHEN "${col.name}"::text = '0' OR "${col.name}"::text = 'false' THEN false 
                            ELSE NULL 
                        END
                    );
                `);
            } catch (err) {
                console.log(`Skipping establishments.${col.name}: ${err.message}`);
            }
        }

        // Add casting for working hours tables
        const workingHoursTables = [
            "establishment_working_hours",
            "department_working_hours",
            "profession_working_hours"
        ];

        for (const table of workingHoursTables) {
            try {
                console.log(`Fixing ${table} columns...`);
                // Fix BOOLEAN is_day_off
                await db.sequelize.query(`
                    ALTER TABLE "${table}" 
                    ALTER COLUMN "is_day_off" DROP DEFAULT,
                    ALTER COLUMN "is_day_off" TYPE BOOLEAN 
                    USING (
                        CASE 
                            WHEN "is_day_off"::text = '1' OR "is_day_off"::text = 'true' THEN true 
                            WHEN "is_day_off"::text = '0' OR "is_day_off"::text = 'false' THEN false 
                            ELSE false 
                        END
                    );
                `);

                // Fix TIME start_time
                await db.sequelize.query(`
                    ALTER TABLE "${table}" 
                    ALTER COLUMN "start_time" DROP DEFAULT,
                    ALTER COLUMN "start_time" TYPE TIME 
                    USING ("start_time"::time without time zone);
                `);

                // Fix TIME end_time
                await db.sequelize.query(`
                    ALTER TABLE "${table}" 
                    ALTER COLUMN "end_time" DROP DEFAULT,
                    ALTER COLUMN "end_time" TYPE TIME 
                    USING ("end_time"::time without time zone);
                `);
            } catch (err) {
                console.log(`Skipping/Failed fixing ${table}: ${err.message}`);
            }
        }

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
