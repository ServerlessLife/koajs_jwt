import * as dbService from "./dbService";
import { MyHttpError } from "./myHttpError";

const SQL_LIKE_INSERT = 'INSERT INTO `like` SET ?';
const SQL_LIKE_DELETE = 'DELETE FROM `like` WHERE username = ? AND likeUsername = ?';
const SQL_USER_LIKE_SELECT_BY_USERNAME = `
    SELECT u.username, COUNT(l.username) AS likesNo
    FROM user AS u
         LEFT OUTER JOIN \`like\` AS l
                 ON u.username = l.likeUsername
    WHERE u.username = ?
    GROUP BY u.username
    `;
const SQL_USER_LIKE_SELECT = `
    SELECT u.username, u.name, u.surname, COUNT(l.username) AS likesNo
    FROM user AS u
         LEFT OUTER JOIN \`like\` AS l
                 ON u.username = l.likeUsername
    GROUP BY u.username, u.name, u.surname, u.email
    ORDER BY COUNT(l.username) DESC
    `;

/**
 * Like a user
 * @param username 
 */
export async function like(likeData: { username: string, likeUsername: string }) {
    if (likeData.username === likeData.likeUsername) {
        throw new MyHttpError('User can not like himslef.', 400, true);
    }

    const connection = await dbService.getConnectionFromPool();
    try {
        await connection.query(SQL_LIKE_INSERT, likeData)
    }
    catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new MyHttpError('User does not exists.', 404, true);
        }
        else if (err.code === 'ER_DUP_ENTRY') {
            throw new MyHttpError('User is already liked.', 409, true);
        }
        else {
            throw err;
        }
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

/**
 * Un-Like a user
 * @param username 
 */
export async function unlike(unlikeData: { username: string, likeUsername: string }) {
    if (unlikeData.username === unlikeData.likeUsername) {
        throw new MyHttpError('User can not unlike himslef.', 400, true);
    }

    const connection = await dbService.getConnectionFromPool();
    let result;
    try {
        result = await connection.query(SQL_LIKE_DELETE, [unlikeData.username, unlikeData.likeUsername])
    }
    finally {
        try { connection.release() } catch (err) { }
    }

    if (result.affectedRows === 0) {
        throw new MyHttpError('There is no like to remove.', 404, true);
    }
}

/**
 * List username & number of likes of a user
 * @param username 
 */
export async function userData(username: string) {
    const connection = await dbService.getConnectionFromPool();
    let result;
    try {
        [result] = await connection.query(SQL_USER_LIKE_SELECT_BY_USERNAME, username)

    }
    finally {
        try { connection.release() } catch (err) { }
    }

    if (!result) {
        throw new MyHttpError(`There is no user ${username}`, 404, true);
    }

    return result;
}

/**
 * List users in a most liked to least liked
 */
export async function mostLiked() {
    const connection = await dbService.getConnectionFromPool();
    try {
        return await connection.query(SQL_USER_LIKE_SELECT)
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}