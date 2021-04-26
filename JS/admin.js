const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
const loggedIn = require('../index');
const { checkValue } = require('./validate');
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


//Admin access is revoked for a given user
//=========================================//
async function revokeAdmin() {
    let toRemove = await inquirer.prompt([
        {
            name: 'user',
            type: 'input',
            message: 'Enter the username of the individual',
            validate: checkValue
        }
    ]);

    let id = await queryPromise('SELECT userid FROM users WHERE ?', {username: toRemove.user});
    if(id.length === 0) {
        let tryAgain = await inquirer.prompt([
            {
                name: 'attempt',
                type: 'confirm',
                message: 'Could not locate record with the given username. Try again?'
            }
        ]);

        (tryAgain ? await revokeAdmin() : console.log('No problem!'));
    } else {
        await queryPromise('UPDATE users SET admin_access = false WHERE ?', {userid: id[0].userid});
        await queryPromise('DELETE FROM admin_users WHERE ?', {userid: id[0].userid});
        console.log('The user\'s admin access has been successfully revoked.');
    }
};

module.exports = {
    manageUsers:
    async function() {
        let choice = await inquirer.prompt([
            {
                name: 'init',
                type: 'list',
                choices: ['Revoke admin access for a user'],
                message: 'Select an action to take:'
            }
        ]);

        switch(choice.init) {
            case 'Revoke admin access for a user':
                await revokeAdmin();
                break;
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