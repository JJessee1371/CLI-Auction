const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
const loggedIn = require('../index');
const { checkNumber } = require('./validate');
require('dotenv').config();
let queryPromise;
let closePromise;

//MySQL connection setup
//=========================//
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});


//Bidding functionality exported to index file
//===============================================//
module.exports = {
    makeBid:
    async function create() {
        try {
            let listed = await queryPromise(`SELECT id AS Item_Id, item AS Item, bid AS Current_Bid, category AS Category, topBidder AS Top_Bidder
            FROM auction_items WHERE ?`, {closed: false});
            if(listed.length === 0) {
                console.log('Sorry, it appears there are no items up for bidding at this time.');
            }
            console.log('Here are all active auctions:');
            console.table(listed);

            let itemChoice = await inquirer.prompt([
                {
                    name: 'item',
                    type: 'list',
                    choices: listed.map(obj => {
                        return `${obj.Item_Id} - ${obj.Item}`;
                    }),
                    message: 'Please select the item you would like to bid on:'
                },
                {
                    name: 'bid',
                    type: 'input',
                    message: 'How much would you like to bid for this item?',
                    validate: checkNumber
                }
            ]);
        
            let selected = await queryPromise('SELECT bid FROM auction_items WHERE ?', {id: itemChoice.item});
            if(selected[0].bid < parseInt(itemChoice.bid)) {
                await queryPromise('UPDATE auction_items SET bid = ?, topBidder = ? WHERE id = ?', [itemChoice.bid, loggedIn.currentUser.name, itemChoice.item]);
                console.log(`Bid for ${itemChoice.bid} successfully posted!`);
            } else {
                console.log(`Your bid must be higher than ${selected[0].bid} please try again`);
                create();
            }
        } catch(err) {
            console.log(err);
        };
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