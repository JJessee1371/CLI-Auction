const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
const cTable = require('console.table');
require('dotenv').config();
const post = require('./JS/post');
const bid = require('./JS/bid');
let queryPromise;
let closePromise;

//MySQL connection setup
//=============================//
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});

//User input validation functions
//=============================//
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
//===================================//
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
    let userid = await queryPromise('SELECT userid FROM users WHERE ?', {username: newUser.username});
    if(userid.length > 0) {
        console.log('That username is already in use, please enter another!');
        signup();
    } else {
        await queryPromise('INSERT INTO users SET ?',
        {
            username: newUser.username,
            password: newUser.password
        });
        console.log('Congratulations you have registered for an account!');
        login();
    }
};


//Users login if they have already registered for an account
//============================================================//
async function login() {
    console.log('Please log in below:');
    let existingUser = await inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Please enter your username:',
            validate: noVal
        },
        {
            name: 'password',
            type: 'input',
            message: 'Please enter your password:',
            validate: noVal
        }
    ]);

    //Determine if account with given information exists and prcoeed to necessary action
    let user = await queryPromise('SELECT userid FROM users WHERE username = ? AND password = ?', 
    [existingUser.username, existingUser.password]);
    console.log(user);
    if(user.length === 0) {
        console.log('We could not locate an account with the given information, please try again!');
        init();
    } else {
        //Export user ID/username to attach to their future actions
        module.exports.currentUser = {
            id: user[0].userid,
            name: existingUser.username
        };
        start();
    }
};


//Initialize the login/signup process before proceeding
//=======================================================//
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
//================================================//
async function start() {
    let initial = await inquirer.prompt([
        {
            name: 'initChoice',
            type: 'list',
            choices: [
                'Manage and create your posts',
                'Bid on an item',
                'EXIT'
            ],
            message: 'Please select your desired action:'
        }
    ]);

    let choice = initial.initChoice;
    switch(choice) {
        case 'Manage and create your posts':
            await post.managePosts();
            start();
            break;
        case 'Bid on an item':
            await bid.makeBid();
            start();
            break;
        case 'EXIT':
            connection.end();
            break;
    }
};

init();

//Promisify queries and establish database connection
connection.connect(err => {
    if(err) console.log(err);
    queryPromise = util.promisify(connection.query).bind(connection);
    closePromise = util.promisify(connection.end).bind(connection);
});

process.on('beforeExit', () => {
    closePromise();
});
