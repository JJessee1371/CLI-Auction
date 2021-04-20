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

function length(input) {
    if(input.length > 20) {
        return ('This field cannot be longer than 20 characters!');
    }
    return true;
};


//New users sign up for an account
async function signup() {
    let newUser = await inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Please enter a username for your account:',
            validate: length
        },
        {
            name: 'password',
            type: 'input',
            message: 'Please enter a password for your account:',
            validate: length
        }
    ]);

    //Determine whether or not the username already exists in the DB and take appropriate action
    let user = await queryPromise('SELECT userid FROM users WHERE ?', {username: newUser.username});
    if(user.length > 0) {
        console.log('That username is already in use, please enter another!');
        signup();
    } else {
        await queryPromise('INSERT INTO users SET ?',
        {
            username: newUser.username,
            password: newUser.password
        });
        console.log('Congratulations you have registered for an account!');
        start();
    }
};

//Users login if they have already registered for an account
async function login() {
    let existingUser = await inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Please enter your username:'
        },
        {
            name: 'password',
            type: 'input',
            message: 'Please enter your password:'
        }
    ]);

    let user = await queryPromise('SELECT userid FROM users WHERE username = ? AND password = ?', 
    [existingUser.username, existingUser.password]);
    if(user.length === 0) {
        console.log('We could not locate an account with the given information, please try again!');
        init();
    } else {
        start();
    }
};

//Initialize the login/signup process before proceeding
async function init() {
    let signupStatus = await inquirer.prompt([
        {
            name: 'login',
            type: 'confirm',
            message: 'Do you already have an accout?'
        }
    ]);

    if(!signupStatus.login) {
        signup();
    } else {
        login();
    }
};

//User is logged in and can begin bidding/posting
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


init();

connection.connect(err => {
    if(err) console.log(err);
    queryPromise = util.promisify(connection.query).bind(connection);
    closePromise = util.promisify(connection.end).bind(connection);
});

process.on('beforeExit', () => {
    closePromise();
});