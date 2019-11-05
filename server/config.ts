import * as dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'very-long-very-random-and-very-secret-secret', 
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser:  process.env.DB_USER ||'root',
    dbPassword:  process.env.DB_PASSWORD ||'root',
    dbName: process.env.DB_NAME || 'user_evalutation'
};

export { config };