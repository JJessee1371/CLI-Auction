const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const util = require('util');
const loggedIn = require('../index');
const validate = require('./validate');
require('dotenv').config();
let queryPromise;
let closePromise;
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


//Post a new item to the database
//=================================//
async function postItem() {
    let postedItem = await inquirer.prompt([
        {
            name: 'item',
            type: 'input',
            message: 'What item would you like to put up for auction?',
            validate: validate.checkValue
        },
        {
            name: 'value',
            type: 'input',
            message: 'What will be the minimum bidding amount for this item?',
            validate: validate.checkNumber
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
        bid: postedItem.value,
        userid: loggedIn.currentUser.id
    });
    console.log(`${postedItem.item} successfully posted!`);
};


//Retrieve all posts from the database that the user has created
//================================================================//
async function viewPosts() {
    let userPosts = await queryPromise(`SELECT id AS Item_ID, item AS Item, category AS Category, bid AS Bid, topBidder AS Top_Bidder, username AS Username
    FROM auction_items AS tbl1
    JOIN users AS tbl2 ON tbl1.userid = tbl2.userid
    WHERE tbl1.userid = ?`, [loggedIn.currentUser.id]);
    if(userPosts.length === 0) {
        let makePost = await inquirer.prompt([
            {
                name: 'create',
                type: 'confirm',
                message: 'It looks like you haven\'t created any posts, would you like to?'
            }
        ]);
        return (makePost.create ? postItem() : console.log('No problem!'));
    } else {
        console.log('Here are all of your listed posts:');
        console.table(userPosts);
    }
};


//Users can modify previously posted items as needed
//===================================================//
async function modifyPost() {
    let confirm = await inquirer.prompt([
        {
            name: 'itemid',
            type: 'confirm',
            message: 'Do you know the item ID number?'
        }
    ]);

    //Retrieve the item ID or update the entry
    if(!confirm.itemid) {
        console.log('Please locate the item ID below:');
        await viewPosts();
    } else {
        let updatedItem = await inquirer.prompt([
            {
                name: 'id',
                type: 'input',
                message: 'What is the items\' id?',
                validate: validate.checkValue
            },
            {
                name: 'item',
                type: 'input',
                message: 'Please reconfirm the item name to be listed.',
                validate: validate.checkValue
            },
            {
                name: 'category',
                type: 'list',
                message: 'Please reconfirm the items\' category.',
                choices: categories
            },
            {
                name: 'value',
                type: 'input',
                message: 'What is this items value? Note: This will restart all bidding.',
                validate: validate.checkValue
            }
        ]);

        await queryPromise(`UPDATE auction_items SET item = ?, value = ?, bid = ?, category = ?, userid = ?
        WHERE id = ?`,
        [updatedItem.item, updatedItem.value, updatedItem.value, updatedItem.category, loggedIn.currentUser.id, updatedItem.id]);
        console.log('The entry has been successfully updated!');
    }
};


//Users can close bidding for a given item
//==========================================//
async function closeBidding() {
    let confirm = await inquirer.prompt([
        {
            name: 'itemid',
            type: 'confirm',
            message: 'Do you know the item ID number?'
        }
    ]);

    //Retreive the item ID or update the status
    if(!confirm.itemid) {
        console.log('Please locate the item ID below:');
        await viewPosts();
    } else {
        let toClose = await inquirer.prompt([
            {
                name: 'id',
                type: 'input',
                message: 'Enter the item ID to close bidding.',
                validate: validate.checkValue
            }
        ]);

        await queryPromise('UPDATE auction_items SET closed = true WHERE ?', {id: toClose.id});
        let finalOffer = await queryPromise('SELECT bid, userid FROM auction_items WHERE ?', {id: toClose.id});
        let finalBidder = await queryPromise('SELECT topBidder FROM auction_items WHERE ?', {id: toClose.id});
        console.log(`Congratulations! Your final offer of ${finalOffer[0].bid} came from user ${finalBidder}`);
    }
};


//All post management options exported to index file for use
//=============================================================//
module.exports = {
    managePosts:
    async function() {
        let userChoice = await inquirer.prompt([
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
                await postItem();
                break;
            case 'View all my posts':
                await viewPosts();
                break;
            case 'Modify a previous post':
                await modifyPost();
                break;
            case 'Close bidding on a post':
                await closeBidding();
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