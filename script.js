console.log("I am Jon. my IP is 172.30.222.85 Mac address is fe80::f0:6980:1b9:92f7%12. Ncc student ID is: 723");

const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
// Connect to the SQLite database
const db = new sqlite3.Database("./book.db", (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the books database.');
});

const dbRun = promisify(db.run).bind(db);
const dbAll = promisify(db.all).bind(db);
// Create readline interface for user input
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

async function listBooks() {
    try {
        const rows = await dbAll('SELECT * FROM books');
        rows.forEach((row) => {
            console.log(`ID: ${row.ID}, Title: ${row.title}, Author: ${row.author}, ISBN: ${row.ISBN}, Description: ${row.description}`);
        });
    } catch (err) {
        console.error(err.message);
    }
}

async function commandInterface() {
    try {
        const title = await askQuestion('Enter book title: ');
        const author = await askQuestion('Enter book author: ');
        const ISBN = await askQuestion('Enter book ISBN: ');
        const description = await askQuestion('Enter book description: ');
        // Insert the new book into the database
        await dbRun('INSERT INTO books (title, author, ISBN, description) VALUES (?, ?, ?, ?)', [title, author, ISBN, description]);
        console.log('Book added successfully.');

        const answer = await askQuestion('Do you want to add another book? (yes/no): ');
        if (answer === 'yes') {
            await commandInterface();
        } else {
            await listBooks();
            readline.close();
        }
    } catch (err) {
        console.error(err.message);
    }
}
// Function to ask a question and return the user's input as a Promise
function askQuestion(question) {
    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            resolve(answer);
        });
    });
}

(async () => {
    try {
        await dbRun('CREATE TABLE IF NOT EXISTS books (ID INTEGER PRIMARY KEY, title TEXT, author TEXT, ISBN TEXT, description TEXT)');
        console.log('Books Table created successfully');
// Start the command interface for adding and listing books
        await commandInterface();
    } catch (err) {
        console.error(err.message);
    }
})();
