const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
const validate = require('./validate');
require('dotenv').config();
let queryPromise;
let closePromise;
const searchOptions = ['By item name', 'By category', 'By username'];
const categories = ['Antiques', 'Books', 'Business & Industrial', 'Clothing & Accessories', 'Collectibles', 'Electronics', 'Home & Garden', 'Pet Supplies', 'Sporting Goods', 'Toys & Hobbies', 'Other'];

//MySQL connection setup
//=======================//
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});


//Search by item name
//=====================//
async function searchItem() {
    let toSearch = await inquirer.prompt([
        {
            name: 'item',
            tyep: 'input',
            message: 'What item would you like to search for?',
            validate: validate.checkValue
        }
    ]);

    let results = await queryPromise(`SELECT id AS Item_Id, item AS Item, category AS Category, bid AS Bid, topBidder AS Top_Bidder
    FROM auction_items WHERE item RLIKE '${toSearch.item}' AND ?`, {closed: false});
    if(results.length === 0) {
        let tryAgain = await inquirer.prompt([
            {
                name: 'attempt',
                type: 'confirm',
                message: 'Sorry, no results were found for your search, try again?'
            }
        ]);

        (tryAgain.attempt ? await searchItem() : console.log('No problem!'));
    } else {
        console.log('Here are the results of your search:');
        console.table(results);
    }
};


//Search by category
//=====================//
async function searchCategory() {
    let toSearch = await inquirer.prompt([
        {
            name: 'category',
            type: 'list',
            choices: categories,
            message: 'Select the the category you would like to search:'
        }
    ]);

    let results = await queryPromise(`SELECT id AS Item_Id, item AS Item, category AS Category, bid AS Bid, topBidder AS Top_Bidder
    FROM auction_items WHERE category = ? AND closed = ?`, [toSearch.category, false]);
    if(results.length === 0) {
        let tryAgain = await inquirer.prompt([
            {
                name: 'attempt',
                type: 'confirm',
                message: 'Sorry, no results were found under this category, try under a new category?'
            }
        ]);

        (tryAgain.attempt ? await searchCategory() : console.log('No problem!'));
    } else {
        console.log('Here are the items listed under this category:');
        console.table(results);
    }
};

//Search by username
//====================//
async function searchUsername() {
    let toSearch = await inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Enter the username(whole or partial) to search for:',
            validate: validate.checkValue
        }
    ]);

    let results = await queryPromise(`SELECT id AS Item_Id, item AS Item, category AS Category, bid AS Bid, topBidder AS Top_Bidder, username AS Username
    FROM auction_items AS tbl1
    JOIN users AS tbl2 ON tbl1.userid = tbl2.userid
    WHERE tbl2.username RLIKE '${toSearch.username}' AND closed = false`);
    if(results.length === 0) {
        let tryAgain = await inquirer.prompt([
            {
                name: 'attempt',
                type: 'confirm',
                message: 'Sorry, no results were found with this search, try again?'
            }
        ]);

        (tryAgain.attempt ? await searchUsername() : console.log('No problem!'));
    } else {
        console.log('Here are the results of your search:');
        console.table(results);
    }
};


module.exports = {
    locate:
    async function() {
        let action = await inquirer.prompt([
            {
                name: 'initDecision',
                type: 'list',
                choices: searchOptions,
                message: 'Choose how you would like to search:'
            }
        ]);

        switch(action.initDecision) {
            case 'By item name':
                await searchItem();
                break;
            case 'By category':
                await searchCategory();
                break;
            case 'By username':
                await searchUsername();
                break;
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