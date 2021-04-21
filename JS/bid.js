const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
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


//User input validation functions
//=================================//
function isNum(input) {
    if(isNaN(input)) {
        return('This value must be a valid number!');
    };
    return true;
};

function noVal(input) {
    if(!input) {
        return('This field cannot be left blank!');
    };
    return true;
};


//Bidding functionality exported to index file
//===============================================//
module.exports = {
    makeBid:
    async function create(user) {
        console.log('Here are the listed items and current bids:');
        let listed = await queryPromise(`SELECT id AS Item_Id, item AS Item, bid AS 'Current Bid', category AS Category, username AS 'Top Bidder'
        FROM auction_items AS tbl1
        JOIN users AS tbl2 ON tbl1.userid = tbl2.userid
        WHERE tbl1.closed = ?`, [false]);
        console.table(listed);

        let idOptions = [];
        listed.forEach(obj => {
            options.push(obj.Item_Id);
        });
    
        let itemChoice = await inquirer.prompt([
            {
                name: 'item',
                type: 'list',
                choices: idOptions,
                message: 'Please select the ID of the item you would like to bid on:'
            },
            {
                name: 'bid',
                type: 'input',
                message: 'How much would you like to bid for this item?',
                validate: isNum
            }
        ]);
    
        let selected = await queryPromise('SELECT bid FROM auction_items WHERE ?', {id: itemChoice.item});
        if(selected[0].bid < parseInt(itemChoice.bid)) {
            await queryPromise('UPDATE auction_items SET bid = ?, userid = ? WHERE id = ?', [itemChoice.bid, user[0].userid, itemChoice.item]);
            console.log(`Bid for ${itemChoice.bid} successfully posted!`);
        } else {
            console.log(`Your bid must be higher than ${selected[0].bid} please try again`);
            create();
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