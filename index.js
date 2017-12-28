require('dotenv').config();
const argv = require('yargs').argv;
const bot = require('./bot.js');

bot.run(argv);
