const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
require('dotenv').config();
let queryPromise;
let closePromise;

//MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});

//User input validation functions
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


//Post an item to the database
async function postItem() {
    let postedItem = await inquirer.prompt([
        {
            name: 'item',
            type: 'input',
            message: 'What item would you like to put up for auction?',
            validate: noVal
        },
        {
            name: 'value',
            type: 'input',
            message: 'What will be the minimum bidding amount for this item?',
            validate: isNum
        },
        {
            name: 'category',
            type: 'list',
            choices: ['Antiques', 'Books', 'Business & Industrial', 'Clothing & Accessories', 'Collectibles', 'Electronics', 'Home & Garden', 'Pet Supplies', 'Sporting Goods', 'Toys & Hobbies', 'Other'],
            message: 'What cateogry does this item fall under?',
        }
    ]);

    await queryPromise('INSERT INTO auction_items SET ?', 
    {
        item: postedItem.item,
        value: postedItem.value,
        category: postedItem.category,
        bid: postedItem.value
    });
    console.log(`${postedItem.item} successfully posted!`);
    start();
};


module.exports = {
    managePosts:
    async function manage() {
        let userChoice = inquirer.prompt([
            {
                name: 'choice',
                type: 'list',
                choices: ['Post an item', 'View all my posts', 'Modify a previous post', 'Close bidding on a post'],
                message: 'Please select an action:'
            }
        ]);

        let action = userChoice.choice;
        switch(action) {
            case 'Post an item':
                postItem();
                break;
        }
    }
};

//Promisify queries and establish database connection
connection.connect(err => {
    if(err) console.log(err);
    queryPromise = util.promisify(connection.query).bind(connection);
    closePromise = util.promisify(connection.end).bind(connection);
});

process.on('beforeExit', () => {
    closePromise();
});