const gm = require("gm").subClass({ imageMagick: true });
const state = require("./state.js");
const spawn = require("child_process").spawn;
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const videoshow = require("videoshow");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

async function videoRobot(){
    content = state.load();

    await convertAllImages(content);
    await createAllSentenceImages(content);
    await createYoutubeThumbnail(content);
    await createAfterEffectsScript(content);
    await renderVideo("node", content);
    
    state.save(content);

    async function convertAllImages(content){
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await convertImage(sentenceIndex);
        };
    };

    async function convertImage(sentenceIndex){
        return new Promise((resolve, reject) => {
            const inputFile = `./content/${sentenceIndex}-original.png[0]`;
            const outputFile = `./content/${sentenceIndex}-resized.png`;
            const width = 1920;
            const height = 1080;

        gm()
            .in(inputFile)
            .out('(')
              .out('-clone')
              .out('0')
              .out('-background', 'white')
              .out('-blur', '0x9')
              .out('-resize', `${width}x${height}^`)
            .out(')')
            .out('(')
              .out('-clone')
              .out('0')
              .out('-background', 'white')
              .out('-resize', `${width}x${height}`)
            .out(')')
            .out('-delete', '0')
            .out('-gravity', 'center')
            .out('-compose', 'over')
            .out('-composite')
            .out('-extent', `${width}x${height}`)
            .write(outputFile, (error) => {
                if (error) {
                    return reject(error)
                };

                console.log(`> [video-robot] Image converted: ${outputFile}`);
                resolve();
                });
        });
    };

    async function createAllSentenceImages(content){
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
        };
    };

    async function createSentenceImage(sentenceIndex, sentenceText) {
        return new Promise((resolve, reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`
    
            const templateSettings = {
                0: {
                  size: '1920x400',
                  gravity: 'center'
                },
                1: {
                  size: '1920x1080',
                  gravity: 'center'
                },
                2: {
                  size: '800x1080',
                  gravity: 'west'
                },
                3: {
                  size: '1920x400',
                  gravity: 'center'
                },
                4: {
                  size: '1920x1080',
                  gravity: 'center'
                },
                5: {
                  size: '800x1080',
                  gravity: 'west'
                },
                6: {
                  size: '1920x400',
                  gravity: 'center'
                },
                7: {
                  size: '1920x1080',
                  gravity: 'center'
                },
                8: {
                  size: '800x1080',
                  gravity: 'west'
                },
                9: {
                  size: '1920x400',
                  gravity: 'center'
                }
    
            }
    
            gm()
                .out('-size', templateSettings[sentenceIndex].size)
                .out('-gravity', templateSettings[sentenceIndex].gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentenceText}`)
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }
              
                    console.log(`>Sentence created: ${outputFile}`)
                    resolve()
                });
        });
    };

    async function createYoutubeThumbnail(content){
        return new Promise((resolve, reject) => {
            gm()
                .in("./content/0-converted.png")
                .write("./content/youtube-thumbnail.jpg", error => {
                    return reject(error);
                });
            
            console.log("> Creating Youtube Thumbnail ...");
            resolve();
        });
    };

    async function createAfterEffectsScript(content) {
        await state.saveScript(content);
      };

    async function renderVideoWithAfterEffects() {
        return new Promise((resolve, reject) => {
            const aerenderFilePath = "/Applications/Adobe After Effects CC 2019/aerender";
            const templateFilePath = `${rootPath}/templates/1/template.aep`;
            const destinationFilePath = `${rootPath}/content/output.mov`;
            
            console.log("> Starting After Effects");

            const aerender = spawn(aerenderFilePath, [
                "-comp",
                "main",
                "-project",
                templateFilePath,
                "-output",
                destinationFilePath
            ]);

            aerender.stdout.on("data", data => {
                process.stdout.write(data);
            });
        
            aerender.on("close", () => {
                console.log("> After Effects closed");
                resolve();
            });
        });
    };
        
    async function renderVideoWithNode(content) {
      return new Promise((resolve, reject) => {
        console.log("> Renderizando vídeo com node.");
  
        let images = [];
        
        images.push({
          path: `./content/0-resized.png`,
          caption: `${content.prefixTerm} ${content.searchTerm}`
        });
        
  
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            images.push({
              path: `./content/${sentenceIndex}-resized.png`,
              caption: content.sentences[sentenceIndex].text
            });
        }
  
        const videoOptions = {
          fps: 25,
          loop: 10, // seconds
          transition: true,
          transitionDuration: 1.5, // seconds
          videoBitrate: 1024,
          videoCodec: "libx264",
          size: '640x?',
          audioBitrate: "128k",
          audioChannels: 2,
          format: "mp4",
          pixelFormat: "yuv420p",
          useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
          subtitleStyle: {
            Fontname: "Verdana",
            Fontsize: "30",
            PrimaryColour: "11861244",
            SecondaryColour: "11861244",
            TertiaryColour: "11861244",
            BackColour: "-2147483640",
            Bold: "2",
            Italic: "0",
            BorderStyle: "2",
            Outline: "2",
            Shadow: "3",
            Alignment: "middle", // left, middle, right
            MarginL: "40",
            MarginR: "60",
            MarginV: "40"
          }
        };
  
        videoshow(images, videoOptions)
          .audio("audio/reggae.mp3")
          .save("content/output.mp4")
          .on("start", function(command) {
            console.log("> Processo ffmpeg iniciado:", command);
          })
          .on("error", function(err, stdout, stderr) {
            console.error("Error:", err);
            console.error("> ffmpeg stderr:", stderr);
            reject(err);
          })
          .on("end", function(output) {
            console.error("> Video criado:", output);
            resolve();
          });
      });
    };

    async function renderVideo(type, content) {
        if (type == "after") {
          await renderVideoWithAfterEffects();
        } else {
          await renderVideoWithNode(content);
        }
    };

};

module.exports = videoRobot;