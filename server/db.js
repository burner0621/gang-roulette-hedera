import sqlite from 'better-sqlite3';

const filepath = "./data.db";

export function createTable(db) {
	db.exec(`
		CREATE TABLE users
		(
			ID INTEGER PRIMARY KEY AUTOINCREMENT,
			username   VARCHAR(50) NOT NULL,
			walletId VARCHAR(50) NOT NULL,
			balance   INTEGER NOT NULL
		);
	`);
	db.close();
}

export function insertRow(username, walletId, balance) {
	const db = new sqlite(filepath);
	let sql = `INSERT INTO users (username, walletId, balance) VALUES (?, ?, ?)`;
	const stmt = db.prepare(sql);
	stmt.run(username, walletId, balance);
}

export function updateRow (username, balance) {
	const db = new sqlite(filepath);
	let sql = `UPDATE users
            SET balance = ?
            WHERE walletId = ?`;
	const stmt = db.prepare(sql);
	stmt.run(balance, username);
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
	updateRow(walletId, parseInt(row['balance']) + parseInt(balance));
}

export function refund(walletId) {
	updateRow(walletId, 0);
}