const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
require('dotenv').config();
const validate = require('./JS/validate');
const post = require('./JS/post');
const bid = require('./JS/bid');
const view = require('./JS/view');
const search = require('./JS/search');
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


//New users sign up for an account
//===================================//
async function signup() {
    let newUser = await inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Please enter a username for your account:',
            validate: validate.checkLength
        },
        {
            name: 'password',
            type: 'input',
            message: 'Please enter a password for your account:',
            validate: validate.checkLength
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
            validate: validate.checkValue
        },
        {
            name: 'password',
            type: 'input',
            message: 'Please enter your password:',
            validate: validate.checkValue
        }
    ]);

    //Determine if account with given information exists and prcoeed to necessary action
    let user = await queryPromise('SELECT userid FROM users WHERE username = ? AND password = ?', 
    [existingUser.username, existingUser.password]);
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
                'Manage, view, and create posts',
                'Bid on an item',
                'View bids you are winning',
                'Search for an item',
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
        case 'View bids you are winning':
            await view.winning();
            start();
            break;
        case 'Search for an item':
            await search.locate();
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