const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
const cTable = require('console.table');
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

//Initializes application
async function start() {
    let initial = await inquirer.prompt([
        {
            name: 'initChoice',
            type: 'list',
            choices: [
                'Post an item',
                'Bid on an item',
                'EXIT'
            ],
            message: 'Would you like to post a new item or bid on an existing one?'
        }
    ]);

    if(initial.initChoice === 'Post an item') {
        post();
    } else if(initial.initChoice === 'Bid on an item') {
        bid();
    } else if(initial.initChoice === 'EXIT') {
        connection.end();
    }
};


//POST new items to the database
async function post() {
    const categories = ['Antiques', 'Books', 'Business & Industrial', 'Clothing & Accessories', 'Collectibles', 'Electronics', 'Home & Garden', 'Pet Supplies', 'Sporting Goods', 'Toys & Hobbies', 'Other'];
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
            choices: categories,
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


//Bid on items that currently exist in the database
async function bid() {
    console.log('Here are the listed items and current bids:');
    let listed = await queryPromise('SELECT item, bid FROM auction_items');
    let options = [];
    listed.forEach(obj => {
        options.push(obj.item);
    });
    console.table(listed);

    let itemChoice = await inquirer.prompt([
        {
            name: 'item',
            type: 'list',
            choices: options,
            message: 'Please select the item you would like to bid on:'
        },
        {
            name: 'bid',
            type: 'input',
            message: 'How much would you like to bid for this item?',
            validate: isNum
        }
    ]);

    let selected = await queryPromise('SELECT bid, id FROM auction_items WHERE ?', {item: itemChoice.item});
    if(selected[0].bid < parseInt(itemChoice.bid)) {
        await queryPromise('UPDATE auction_items SET bid = ? WHERE id = ?', [itemChoice.bid, selected[0].id]);
        console.log(`Bid for ${itemChoice.bid} successfully posted!`);
        start();
    } else {
        console.log(`Your bid must be higher than ${selected[0].bid} please try again`);
        start();
    }
};


start();

connection.connect(err => {
    if(err) console.log(err);
    queryPromise = util.promisify(connection.query).bind(connection);
    closePromise = util.promisify(connection.end).bind(connection);
    console.log(`Connected as ID ${connection.threadId}`);
});

process.on('beforeExit', () => {
    closePromise();
});