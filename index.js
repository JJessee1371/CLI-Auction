const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
require('dotenv').config();

//MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});

let queryPromise;
let closePromise;

//User input validation functions
function isNum(input) {
    if(isNaN(input)) {
        return('This value must be a valid number!');
    };
};

function noVal(input) {
    if(!input) {
        return('This field cannot be left blank!');
    };
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
    } else if (initial.initChoice === 'Bid on an item') {
        bid();
    }
};


//POST new items to the database
async function post() {
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
            type: 'input',
            message: 'What cateogry does this item fall under?',
            validate: noVal
        }
    ]);

    connection.query('INSERT INTO auction_items SET ?', 
    {
        item: postedItem.item,
        value: postedItem.value,
        category: postedItem.category,
        bid: postedItem.value
    });
    start();
};


//Bid on items that are already in the database
// function bid() {
//     let query = 'SELECT * FROM auction_items';
//     connection.query(query, (err, res) => {
//         if(err) throw err;

//         inquirer.prompt([
//             {
//                 name: 'choose',
//                 type: 'rawlist',
//                 choices: function() {
//                     let choiceArr = [];
//                     for(i = 0; i < res.length; i++) {
//                         choiceArr.push(res[i].item);
//                     };
//                     return choiceArr;
//                 },
//                 message: 'Please select the item you would like to bid on:'
//             },
//             {
//                 name: 'bid',
//                 type: 'input',
//                 message: 'How much would you like to bid for this item?',
//                 validate: isNum
//             }
//         ])
//         .then(data => {
//             let chosenItem = '';
//             res.forEach(obj => {
//                 if(obj.item === data.choose) {
//                     chosenItem = obj;
//                 };
//             });

//             if(chosenItem.bid < parseInt(data.bid)) {
//                 connection.query(
//                     `UPDATE auction_items SET bid=${data.bid} WHERE id=${chosenItem.id}`,
//                     (err) => {
//                         if(err) throw err;
//                         console.log('Bid successfully updated');
//                         start();
//                     }
//                 );
//             } else {
//                 console.log('The amount you bid was too low');
//                 start();
//             };
//         });
//     });
// };


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