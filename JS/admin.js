const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
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
    try {
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
            console.log('The users\' admin access has been successfully revoked.');
        }
    } catch(err) {
        console.log(err);
    };
};

//Block a user for violation of rules
//=====================================//
async function removeUser() {
    try {
        let toDelete = await inquirer.prompt([
            {
                name: 'user',
                type: 'input',
                message: 'Enter the username of the individual',
                validate: checkValue
            }
        ]);
    
        let id = await queryPromise('SELECT userid FROM users WHERE ?', {username: toDelete.user});
        if(id.length === 0) {
            let tryAgain = await inquirer.prompt([
                {
                    name: 'attempt',
                    type: 'confirm',
                    message: 'Could not locate record with the given username. Try again?'
                }
            ]);
    
            (tryAgain ? await removeUser() : console.log('No problem!'));
        } else {
            await queryPromise('DELETE FROM users WHERE ?', {username: toDelete.user});
            console.log('The users\' account has been deleted.');
        }
    } catch(err) {
        console.log(err);
    };
};


//Chaneg password for admin users
//================================//
async function changePassword() {
    try {
        let newPass = await inquirer.prompt([
            {
                name: 'pass',
                type: 'input',
                message: 'Please input the new password for admin users:'
            }
        ]);

        await queryPromise('UPDATE admin_users SET ?', {admin_password: newPass.pass});
        console.log('The admin access password has been updated!');
    } catch(err) {
        console.log(err);
    };
};

module.exports = {
    manageUsers:
    async function() {
        try {
            let choice = await inquirer.prompt([
                {
                    name: 'init',
                    type: 'list',
                    choices: ['Revoke admin access for a user', 'Remove a users\' account', 'Update the admin password'],
                    message: 'Select an action to take:'
                }
            ]);
    
            switch(choice.init) {
                case 'Revoke admin access for a user':
                    await revokeAdmin();
                    break;
                case 'Remove a users\' account':
                    await removeUser();
                    break;
                case 'Update the admin password':
                    await changePassword();
                    break;
            };
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