const textRobot = {
    userInput: require("./robots/userInput.js"),
    text: require("./robots/text.js"),
    state: require("./robots/state.js")
}

async function start() {
    
    textRobot.userInput();
    await textRobot.text();

    const content = textRobot.state.load();

   console.dir(content , { depth: null });

};

start();