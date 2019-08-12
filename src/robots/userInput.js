const readline = require("readline-sync");

function userInput(content){

content.searchTerm = askAndReturnSearchTerm();

function askAndReturnSearchTerm(){
    return readline.question('Type a Wikipedia search term: ');
};


content.prefixTerm = askAndReturnPrefixTerm();

function askAndReturnPrefixTerm(){
    const prefix = ["Who is ", "What is ", "The history of "]
    const prefixText = readline.keyInSelect(prefix, `Choose one prefix to search about ${content.searchTerm} :`);
    
    return prefix[prefixText];
};

};

module.exports = userInput;