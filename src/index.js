const textRobot = {
    userInput: require("./robots/userInput.js"),
    text: require("./robots/text.js")
}

async function start() {
const content = {
    maximumSentences: 7
};

textRobot.userInput(content);
await textRobot.text(content);

console.log(content.sentences);
};

start();