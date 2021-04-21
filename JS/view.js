const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
const loggedIn = require('../index');
const bid = require('./bid');
require('dotenv').config();
let queryPromise;
let closePromise;

//MySQL connection setup
//=======================//
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});


module.exports = {
    winning:
    async function() {
        let winningBids = await queryPromise('SELECT id AS Item_Id, item AS Item, category AS Category, bid AS Bid FROM auction_items WHERE topBidder = ? and closed = ?',
        [loggedIn.currentUser.name, false]);
        if(winningBids.length === 0) {
            let makeBid = await inquirer.prompt([
                {
                    name: 'bid',
                    type: 'confirm',
                    message: 'It appears you have no winning bids. Would you like to bid again?'
                }
            ]);

            return (makeBid.bid ? bid.makeBid() : console.log('No problem!'));
        } else {
            console.log('Here are your current winning bids:');
            console.table(winningBids);
        }
    }
};


//Promisify queries and establish database connection
//=======================================================//
connection.connect(err => {
    if(err) console.log(err);
    queryPromise = util.promisify(connection.query).bind(connection);
    closePromise = util.promisify(connection.end).bind(connection);
});

process.on('beforeExit', () => {
    closePromise();
});