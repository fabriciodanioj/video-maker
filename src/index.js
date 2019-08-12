const textRobot = {
    userInput: require("./robots/userInput.js"),
    text: require("./robots/text.js")
}

async function start() {
const content = {};

textRobot.userInput(content);
await textRobot.text(content);

console.log(content);
};

start();