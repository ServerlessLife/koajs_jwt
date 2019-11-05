import * as bcrypt from 'bcrypt'
import * as dbService from "./dbService";
import { HttpError } from './httpError';
import * as jsonwebtoken from 'jsonwebtoken'
import { config } from '../config';
import { Connection } from 'promise-mysql-native';

const SQL_USER_INSERT = 'INSERT INTO user SET ?';
const SQL_USER_UPDATE_PASSWORD = 'UPDATE user SET password = ? WHERE username = ?';
const SQL_USER_SELECT_BY_USERNAME = 'SELECT username, name, surname, email, password FROM user WHERE username = ?';

/**
 * Sign up to the system (username, password)
 * @param user  
 */
export async function signup(user: {
    username: string,
    name: string,
    surname: string,
    email: string,
    password: string
}) {
    if (!user.username || !user.password || !user.email || !user.name || !user.surname) {
        throw new HttpError('Expected an object with username, name, surname, email, password.', 400, true);
    }

    let passwordHash = await _hashPassword(user.password);

    const connection = await dbService.getConnectionFromPool();
    try {
        await connection.query(SQL_USER_INSERT, {
            username: user.username,
            name: user.name,
            surname: user.surname,
            email: user.email,
            password: passwordHash
        });

        return _createJwt({
            username: user.username,
            name: user.name,
            surname: user.surname,
            email: user.email,
        })
    }
    catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new HttpError('User exists.', 406, true);
        }
        else {
            throw err;
        }
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

async function _hashPassword(password: string) {
    let passwordHash = await bcrypt.hash(password, 5);

    return passwordHash;
}

/**
 * Logs in an existing user with a password
 * @param auth 
 */
export async function login(auth: {
    username: string,
    password: string
}) {
    const connection = await dbService.getConnectionFromPool();
    try {
        let user = await _validatePasswordAndGetUser(connection, auth);
        if (user) {
            return _createJwt({
                username: user.username,
                name: user.name,
                surname: user.surname,
                email: user.email,
            })
        } else {
            throw new HttpError('Invalid username or password.', 401, true);
        }
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

async function _validatePasswordAndGetUser(connection: Connection, auth: {
    username: string,
    password: string
}) {
    let [user] = await connection.query(SQL_USER_SELECT_BY_USERNAME, auth.username);
    if (user && await bcrypt.compare(auth.password, user.password)) {
        return user;
    }
}

function _createJwt(user: UserJwt) {
    return {
        token: jsonwebtoken.sign({
            data: user,
            //exp in seconds
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 60 seconds * 60 minutes = 1 hour
        }, config.jwtSecret)
    };
}

/**
 * Get the currently logged in user information 
 */
export async function getUserData(username: string) {
    const connection = await dbService.getConnectionFromPool();
    try {
        let [user] = await connection.query(SQL_USER_SELECT_BY_USERNAME, username);

        return {
            username: user.username,
            name: user.name,
            surname: user.surname,
            email: user.email,
        }
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

/**
 * Update the current users password
 * @param passwordChange 
 */
export async function updatePassword(passwordChange: { username: string, oldPassword: string, newPassword: string }) {
    const connection = await dbService.getConnectionFromPool();
    try {
        let user = await _validatePasswordAndGetUser(connection, {
            username: passwordChange.username, password: passwordChange.oldPassword
        });
        if (user) {
            let newPasswordHash = await _hashPassword(passwordChange.newPassword);
            await connection.query(SQL_USER_UPDATE_PASSWORD, [newPasswordHash, passwordChange.username]);

            return _createJwt({
                username: user.username,
                name: user.name,
                surname: user.surname,
                email: user.email,
            })
        } else {
            throw new HttpError('Invalid old password.', 401, true);
        }
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

class UserJwt {
    username: string;
    name: string;
    surname: string;
    email: string;
}