require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});

function start() {
    inquirer.prompt([
        {
            name: 'choose',
            type: 'list',
            choices: [
                'POST',
                'BID'
            ],
            message: 'Would you like to post a new item or bid on an existing one?'
        }
    ])
    .then(data => {
        if(data.choose == 'POST') {
            post();
        } else if(data.choose == 'BID') {
            bid();
        } else process.end();
    })
};

function post() {
    inquirer.prompt([
        {
            name: 'item',
            type: 'input',
            message: 'What item would you like to put up for auction?'
        },
        {
            name: 'value',
            type: 'input',
            message: 'What will be the minimum bidding amount for this item?'
        },
        {
            name: 'category',
            type: 'input',
            message: 'What cateogry does this item fall under?'
        }
    ])
    .then(data => {
        connection.query(
            'INSERT INTO auction_items'
        )
    })
};

function bid() {

};

connection.connect(err => {
    if(err) throw err;
    console.log(`Connected as ID ${connection.threadId}`);
});

process.on('exit', function(code) {
    connection.end();
    return console.log(`About to exit with code ${code}`);
});