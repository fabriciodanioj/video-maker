const readline = require("readline-sync");

function start(){
    const content = {};

    content.searchTerm = askAndReturnSearchTerm();
    
    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ');
    };


    content.PrefixTerm = askAndReturnPrefixTerm();
    
    function askAndReturnPrefixTerm(){
        const prefix = ["Who is ", "What is ", "The history of "]
        const prefixText = readline.keyInSelect(prefix, "Choose one prefix:");
        
        return prefix[prefixText];
    };

    console.log(content);
};

start();