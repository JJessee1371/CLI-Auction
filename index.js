require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');

//MySQL setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: process.env.DB_PASS,
    database: 'myauction_db'
});

//Initializes application and collects user input
function start() {
    inquirer.prompt([
        {
            name: 'choose',
            type: 'list',
            choices: [
                'POST',
                'BID',
                'EXIT'
            ],
            message: 'Would you like to post a new item or bid on an existing one?'
        }
    ])
    .then(data => {
        if(data.choose == 'POST') {
            post();
        } else if(data.choose == 'BID') {
            bid();
        } else process.end();
    })
    .catch(err => {
        if(err) throw err;
    });
};

//POST new items to the database
function post() {
    inquirer.prompt([
        {
            name: 'item',
            type: 'input',
            message: 'What item would you like to put up for auction?'
        },
        {
            name: 'value',
            type: 'input',
            message: 'What will be the minimum bidding amount for this item?'
        },
        {
            name: 'category',
            type: 'input',
            message: 'What cateogry does this item fall under?'
        }
    ])
    .then(data => {
        connection.query(
            'INSERT INTO auction_items SET ?',
            {
                item: data.item,
                value: data.value,
                category: data.category
            }
        ),
        (err, res) => {
            if(err) throw err;
        };
        start();
    });
};

//Bid on items that are already in the database
function bid() {
    let query = 'SELECT * FROM auction_items';
    connection.query(query, (err, res) => {
        if(err) throw err;

        inquirer.prompt([
            {
                name: 'choose',
                type: 'rawlist',
                choices: function() {
                    let choiceArr = [];
                    for(i = 0; i < res.length; i++) {
                        choiceArr.push(res[i].item);
                    };
                    return choiceArr;
                },
                message: 'Please select the item you would like to bid on:'
            },
            {
                name: 'bid',
                type: 'input',
                message: 'How much would you like to bid for this item?'
            }
        ])
        .then(data => {
            let chosenItem = '';
            res.forEach(obj => {
                if(obj.item === data.choose) {
                    chosenItem = obj;
                };
            });

            if(chosenItem.bid < parseInt(data.bid)) {
                connection.query(
                    `UPDATE auction_items SET bid=${data.bid} WHERE id=${chosenItem.id}`,
                    (err, res) => {
                        if(err) throw err;
                        console.log('Bid successfully updated');
                        start();
                    }
                );
            } else {
                console.log('The amount you bid was too low');
                bid();
            };
        });
    });
};


start();

connection.connect(err => {
    if(err) throw err;
    console.log(`Connected as ID ${connection.threadId}`);
});

process.on('exit', function(code) {
    connection.end();
    return console.log(`About to exit with code ${code}`);
});