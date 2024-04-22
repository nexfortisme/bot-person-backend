import Surreal from 'surrealdb.js';

let db = new Surreal();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_NAMESPACE = process.env.DB_NAMESPACE;

async function GetDBConnection(): Promise<any> {

    console.log(DB_HOST);
    console.log(DB_USER);
    console.log(DB_PASSWORD);
    console.log(DB_NAME);
    console.log(DB_NAMESPACE);

    try {
        await db.connect(DB_HOST ?? '', {
			// Set the namespace and database for the connection
			namespace: DB_NAMESPACE ?? '',
			database: DB_NAME ?? '',

			// Set the authentication details for the connection
			auth: {
				namespace: DB_NAMESPACE,
				database: DB_NAME,
				scope: 'allusers',
				username: DB_USER,
				password: DB_PASSWORD,
			},
		});

        return db;
    } catch(e) {
        console.error(e);
        return undefined;
    }
}

export default GetDBConnection;