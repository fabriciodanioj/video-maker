const algorithmia = require("algorithmia");
const algorithmiaApiKey = require("../apiKeys/algorithmiaKey.json").apiKey;
const sentenceBoundaryDetection = require("sbd");



async function textRobot(content) {
    await downloadContentFromWiki(content);
    await sanitizeContent(content);
    breakContentIntoSentences(content);


    async function downloadContentFromWiki(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300"); // timeout is optional
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponse.get();

        content.sourceContentOriginal = wikipediaContent.content;
    };

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLines(content.sourceContentOriginal);
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

        content.sourceContentSanitized = withoutDatesInParentheses;

        function removeBlankLines(text){
            const allLines = text.split("\n");

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith("=")){
                    return false;
                }
                return true;
            })

        return withoutBlankLinesAndMarkdown.join(" ");
        };

        function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        };
    };

    function breakContentIntoSentences(content){
        content.sentences = [];

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
        
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            });
        });
    };
};


module.exports = textRobot;