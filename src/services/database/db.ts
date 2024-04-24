import Surreal from 'surrealdb.js';

let db = new Surreal();

const DB_HOST = Bun.env.DB_HOST;
const DB_USER = Bun.env.DB_USER;
const DB_PASSWORD = Bun.env.DB_PASSWORD;
const DB_NAME = Bun.env.DB_NAME;
const DB_NAMESPACE = Bun.env.DB_NAMESPACE;

async function GetDBConnection(): Promise<any> {  

    try {
        await db.connect(DB_HOST ?? '', {
			// Set the namespace and database for the connection
			namespace: DB_NAMESPACE ?? '',
			database: DB_NAME ?? '',

			// Set the authentication details for the connection
			auth: {
				namespace: DB_NAMESPACE ?? '',
				database: DB_NAME ?? '',
				username: DB_USER ?? '',
				password: DB_PASSWORD ?? '',
			},
		});

        return db;
    } catch(e) {
        console.error(e);
        return undefined;
    }
}

export default GetDBConnection;