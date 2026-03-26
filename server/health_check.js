const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const check = async () => {
    console.log('=== PROJECT HEALTH CHECK ===');

    // 1. Env check
    const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
    requiredEnv.forEach(env => {
        if (!process.env[env]) console.error(`❌ MISSING ENV: ${env}`);
        else console.log(`✅ ENV FOUND: ${env}`);
    });

    // 2. Folder check
    const uploadsDir = path.resolve(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        console.error('❌ MISSING FOLDER: uploads');
        fs.mkdirSync(uploadsDir);
        console.log('🛠️ Created uploads folder');
    } else {
        console.log('✅ UPLOADS FOLDER: OK');
    }

    // 3. DB Check
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MONGODB CONNECTION: OK');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ DB COLLECTIONS: ${collections.map(c => c.name).join(', ')}`);

    } catch (e) {
        console.error('❌ MONGODB CONNECTION FAILED:', e.message);
    } finally {
        await mongoose.disconnect();
    }

    // 4. Controller/Route sanity
    const controllersDir = path.resolve(__dirname, 'controllers');
    const controllers = fs.readdirSync(controllersDir);
    controllers.forEach(file => {
        try {
            require(path.join(controllersDir, file));
            console.log(`✅ CONTROLLER LOAD: ${file}`);
        } catch (e) {
            console.error(`❌ CONTROLLER ERROR (${file}):`, e.message);
        }
    });

    console.log('=== CHECK COMPLETE ===');
    process.exit(0);
};

check();
