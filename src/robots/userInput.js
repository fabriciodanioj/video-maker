const readline = require("readline-sync");
const state = require("./state.js");


function userInput(){
    const content = {
        maximumSentences: 7
    };

    content.searchTerm = askAndReturnSearchTerm();
    content.prefixTerm = askAndReturnPrefixTerm();
    content.lang = askAndReturnLanguage();

    state.save(content);

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ');
    };


    function askAndReturnPrefixTerm(){
        const prefix = ["Who is ", "What is ", "The history of "]
        const prefixText = readline.keyInSelect(prefix, `Choose one prefix to search about ${content.searchTerm} :`);

        return prefix[prefixText];
    };


    function askAndReturnLanguage(){
        const language = ['pt','en']
        const selectedLangIndex = readline.keyInSelect(language,'Choose Language: ');

        return language[selectedLangIndex];
    };
};

module.exports = userInput;