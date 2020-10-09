require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction'
});

// function start() {
//     inquirer.prompt([
//         {
//             name: 'choose',
//             type: 'list',
//             choices: [
//                 'POST',
//                 'BID'
//             ],
//             message: 'Would you like to post a new item or bid on an existing one?'
//         }
//     ])
//     .then(data => {
//         if(data.choose == 'POST') {
//             post();
//         } else if(data.choose == 'BID') {
//             bid();
//         } else process.end();
//     })
// };

// function post() {

// };

// function bid() {

// };

connection.connect(err => {
    if(err) throw err;
    console.log(`Connected as ID ${connection.threadId}`);
});

process.on('exit', function(code) {
    connection.end();
    return console.log(`About to exit with code ${code}`);
});