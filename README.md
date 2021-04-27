# Great Bay Auction

## Table of Contents
* [Description](#Description)
* [Installation and Use](#Installation_and_Use)
* [Technologies](#Technologies)
* [Future Development](#Future_Development)
* [Contributing](#Contributing)
* [License](#License)

## Description
This command line interface allows its users to experience taking part in an auction within their own terminal. They sign up for an account and can then post their own items, make bids on others that are listed, view their post history, search for items, and a number of other actiions. All data is stored in a MySQL database and the user interactions are facilitated through the use of the inquirer module. In order to display data to the user in an easily readable format, I also made use of the console.table module. My goal was to demonstrate a solid ability to perform all CRUD operations within a MySQL environment and give the user an experience that has a logical flow and allows them felxibility in the actions they can take. 

## Installation and Use
This code is under the MIT license and available to all users so feel free to clone it from the authors' GitHub repository. Please note that this application has not yet been deployed to Heroku and as such can only be used in the local environment currently. Once it is cloned to your machine, open the terminal and run the command 'npm start'. From there you will be guided through the signup process by the inquirer module prompts. 

## Technologies
* Node.js
* MySQL
* Inquirer
* Console.table
* Dotenv
* Jest

## Future Development
In order to refine this application, I would like to include a module like passport.js that would allow me to make the database more secure and protect the more sensitive information that users are asked to enter during the signup process. Once the database is more secure I would like to include an email address for each user and if they so choose, they would receive notification by email when an auction is closed in which they are the top bidder. Aside from those more major modifications, I will continue to review the existing logic and rearrange it to provide maximum efficiency and a smoothly flowing experience.    

## Contributing
Any and all contributions to this project are welcome. Please contact the creator at tjessee7624@gmail.com in order to do so. Thank you!

## License
MIT License

Copyright (c) 2020 Jonathan Jessee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.