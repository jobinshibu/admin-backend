const db = require('../models');

async function cleanupSearch() {
    try {
        const searchModel = db.Search || db.search;
        if (!searchModel) {
            console.error('Search model not found');
            return;
        }

        // Keep only establishment related types (hospital, clinic, pharmacy, laboratory, others)
        // and remove doctor/speciality/service/package legacy types
        const validTypes = ['hospital', 'clinic', 'pharmacy', 'laboratory', 'others', 'doctor']; // Keeping doctor for now if needed, but the objective was establishment centric.
        // Actually, user said: "search result should always establishment, no other thing is not required"
        // So let's keep only'hospital', 'clinic', 'pharmacy', 'laboratory', 'others'

        const count = await searchModel.destroy({
            where: {
                type: {
                    [db.Sequelize.Op.notIn]: ['hospital', 'clinic', 'pharmacy', 'laboratory', 'others']
                }
            }
        });

        console.log(`Cleanup complete. Removed ${count} non-establishment search entries.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupSearch();
