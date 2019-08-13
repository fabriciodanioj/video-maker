const textRobot = {
    userInput: require("./robots/userInput.js"),
    text: require("./robots/text.js"),
    state: require("./robots/state.js"),
    images: require("./robots/images.js")
};

async function start() {
    
    textRobot.userInput();
    await textRobot.text();
    await textRobot.images();

    const content = textRobot.state.load();

    console.dir(content , { depth: null });

};

start();