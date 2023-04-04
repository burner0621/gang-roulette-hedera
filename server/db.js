import sqlite from 'better-sqlite3';

const filepath = "./data.db";

export function createTable(db) {
	db.exec(`
		CREATE TABLE users
		(
			ID INTEGER PRIMARY KEY AUTOINCREMENT,
			username   VARCHAR(50) NOT NULL,
			walletId VARCHAR(50) NOT NULL,
			balance   INTEGER NOT NULL,
			win       INTEGER NOT NULL,
			lost      INTEGER NOT NULL
		);
	`);
	db.close();
}

export function insertRow(username, walletId, balance) {
	const db = new sqlite(filepath);
	let sql = `INSERT INTO users (username, walletId, balance) VALUES (?, ?, ?)`;
	const stmt = db.prepare(sql);
	stmt.run(username, walletId, balance);

	sql =  `INSERT INTO
				logs
				(
					walletId, 
					balance, 
					isWin, 
					bet
				)
			VALUES
				(?, ?, ?, ?)`;

	stmt = db.prepare(sql);
	stmt.run(walletId, balance, 'deposit', 0);
}

export function resetRow (walletId) {
	const db = new sqlite(filepath);
	let sql =  `UPDATE
					users
				SET
					balance = 0,
					win = 0,
					lost = 0
				WHERE
					walletId = ?`;
	const stmt = db.prepare(sql);
	stmt.run(walletId);
}

export function updateRow (walletId, balance) {
	const db = new sqlite(filepath);
	let sql =  `UPDATE
					users
				SET
					balance = ?
				WHERE
					walletId = ?`;
	const stmt = db.prepare(sql);
	stmt.run(balance, walletId);
}

export function updateRowWL (walletId, balance, bet, isWin) {
	console.log('balance: ', balance);
	console.log('bet: ', bet);
	console.log('win: ', isWin);

	const db = new sqlite(filepath);
	let sql =  `UPDATE
					users
				SET
					balance = ?
				WHERE
					walletId = ?`;
	const stmt = db.prepare(sql);
	stmt.run(balance, walletId);

	sql =  `INSERT INTO
				logs
				(
					walletId, 
					balance, 
					isWin, 
					bet
				)
			VALUES
				(?, ?, ?, ?)`;

	stmt = db.prepare(sql);
	stmt.run(walletId, balance, isWin, bet);
}

export function getRow(walletId) {
	const db = new sqlite(filepath);
	let sql = `SELECT * FROM users WHERE walletId = ?`;
	const stmt = db.prepare(sql);
	var row = stmt.get(walletId);
	return row;
}

export function deposit(walletId, balance) {
	var row = getRow(walletId);
	updateRow(walletId, parseFloat(row['balance']) + parseFloat(balance));
}

export function refund(walletId) {
	console.log('resetRow: function');
	console.log(walletId);

	resetRow(walletId);
}
