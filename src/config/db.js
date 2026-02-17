const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        const dbName = process.env.MONGODB_DB_NAME || undefined;

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ...(dbName ? { dbName } : {}),
        });
        console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;