import Surreal from 'surrealdb.js';

let db = new Surreal();
let dbInstance: Surreal;

const DB_HOST = Bun.env.DB_HOST;
const DB_USER = Bun.env.DB_USER;
const DB_PASSWORD = Bun.env.DB_PASSWORD;
const DB_NAME = Bun.env.DB_NAME;
const DB_NAMESPACE = Bun.env.DB_NAMESPACE;

async function GetDBConnection(): Promise<any> {

	if (dbInstance) {
		return dbInstance;
	}

	console.log('DB_HOST', DB_HOST);
	console.log('DB_USER', DB_USER);
	console.log('DB_PASSWORD', DB_PASSWORD);
	console.log('DB_NAME', DB_NAME);
	console.log('DB_NAMESPACE', DB_NAMESPACE);

	try {
		await db.connect(DB_HOST ?? '');
		let token = await db.signin({
			username: DB_USER ?? '',
			password: DB_PASSWORD ?? ''
		});
		await db.use({
			namespace: DB_NAMESPACE ?? '', 
			database: DB_NAME ?? ''
		});
		await db.authenticate(token);

		dbInstance = db;
		return dbInstance;
	} catch (e) {
		console.error(e);
		return undefined;
	}
}

export default GetDBConnection;