import * as dbService from "./dbService";

const SQL_LIKE_INSERT = 'INSERT INTO `like` SET ?';
const SQL_LIKE_DELETE = 'DELETE FROM `like` WHERE username = ? AND likeUsername = ?';
const SQL_USER_LIKE_SELECT_BY_USERNAME = `
    SELECT u.username, u.name, u.surname, u.email, COUNT(l.username) AS likes
    FROM user AS u
         LEFT OUTER JOIN \`like\` AS l
                 ON u.username = l.likeUsername
    WHERE u.username = ?
    GROUP BY u.username, u.name, u.surname, u.email
    `;
const SQL_USER_LIKE_SELECT = `
    SELECT u.username, u.name, u.surname, COUNT(l.username) AS likes
    FROM user AS u
         LEFT OUTER JOIN \`like\` AS l
                 ON u.username = l.likeUsername
    GROUP BY u.username, u.name, u.surname, u.email
    `;

/**
 * Like a user
 * @param username 
 */
export async function like(likeData: { username: string, likeUsername: string}) {
    const connection = await dbService.getConnectionFromPool();
    try {
        await connection.query(SQL_LIKE_INSERT, likeData)
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

/**
 * Un-Like a user
 * @param username 
 */
export async function unlike(unlikeData: { username: string, likeUsername: string}) {
    const connection = await dbService.getConnectionFromPool();
    try {
        await connection.query(SQL_LIKE_DELETE, [unlikeData.username, unlikeData.likeUsername])
    }
    finally {
        try { connection.release() } catch (err) { }
    }
}

/**
 * List username & number of likes of a user
 * @param username 
 */
export async function userData(username: string) {
    const connection = await dbService.getConnectionFromPool();
    try {
        return await connection.query(SQL_USER_LIKE_SELECT_BY_USERNAME, username)
    }
    finally {
        try { connection.release() } catch (err) { }
    }
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