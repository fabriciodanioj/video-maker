const robots = {
    userInput: require("./robots/userInput.js"),
    text: require("./robots/text.js"),
    state: require("./robots/state.js"),
    images: require("./robots/images.js"),
    video: require("./robots/video.js")
};

async function start() {
    
    robots.userInput();
    await robots.text();
    await robots.images();
    await robots.video();
    const content = robots.state.load();

    //console.dir(content , { depth: null });

};

start();