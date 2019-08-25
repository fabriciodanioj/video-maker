const readline = require("readline-sync");
const state = require("./state.js");


function userInput(){
    const content = {
        maximumSentences: 10
    };

    content.lang = askAndReturnLanguage();
    content.searchTerm = askAndReturnSearchTerm();
    content.prefixTerm = askAndReturnPrefixTerm();
    

    state.save(content);
    
    function askAndReturnLanguage(){
        const language = ['pt','en']
        const selectedLangIndex = readline.keyInSelect(language,'Choose Language: ');

        return language[selectedLangIndex];
    };

    
    function askAndReturnSearchTerm(){
        if(content.lang === "en"){
            return readline.question('Type a Wikipedia search term: ');
        } else {
            return readline.question('Escolha um termo para pesquisar na wikipédia: ');
        }
    };

    function askAndReturnPrefixTerm(){
        if(content.lang === "en"){
            const prefix = ["Who is ", "What is ", "The history of "]
            const prefixText = readline.keyInSelect(prefix, `Choose one prefix to search about ${content.searchTerm} :`);
    
            return prefix[prefixText];
        } else {
            const prefix = ["Quem é", "O que é", "A história de"]
            const prefixText = readline.keyInSelect(prefix, `Escolha um termo para pesquisar sobre ${content.searchTerm}:`);
    
            return prefix[prefixText];
        };   
    };    
};

module.exports = userInput;