const algorithmia = require("algorithmia");
const sentenceBoundaryDetection = require("sbd");
const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1.js");

const algorithmiaApiKey = require("../apiKeys/algorithmiaKey.json").apiKey;
const watsonApiKey = require("../apiKeys/watsonKey.json").apikey;


const nlu = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    iam_apikey: watsonApiKey,
    url: "https://gateway-syd.watsonplatform.net/natural-language-understanding/api"
  });

async function textRobot(content) {
    await downloadContentFromWiki(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);
    limitMaximumSentences(content);
    await AddKeywords(content)

    async function downloadContentFromWiki(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2");
        const wikipediaResponse = await wikipediaAlgorithm.pipe({
            "lang" : content.lang,
            "articleName": content.searchTerm
          })
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

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    };
    
    async function AddKeywords(content){
        for (const sentence of content.sentences) {
            sentence.keywords = await extractKeywords(sentence.text);
        }
    };

    async function extractKeywords(sentence){
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }        
            }, 

                (error, response) => {
                    if (error) {
                        throw error
                    }
        
                    const keywords = response.keywords.map((keyword) => {
                        return keyword.text;
                    });
                    
                    resolve(keywords);
                } 
            )}
        )
    };


};


module.exports = textRobot;