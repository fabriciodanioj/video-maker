const state = require("./state");
const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;
const express = require("express");

async function youtubeRobot() {
    const content = state.load();

    await authenticateWithOAuth();
    //await uploadVideo();
    //await uploadThumbnail();

    async function authenticateWithOAuth() {

        const webServer = await startWebServer();
        const OAuthClient = await createOAuthClient();
        await requestUserConsent(OAuthClient, content);
        const authorizationToken = await waitForGoogleCallBack(webServer, content);
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
        await setGlobalGoogleAuthentication(OAuthClient);
        await stopWebServer();

        async function startWebServer() {
            return new Promise((resolve, reject) => {
                const app = express();
                // Express settings
                app.disable('x-powered-by');

                const PORT = 5000;

                const server = app.listen(PORT, () => {
                    console.log(`> Listening on http://localhost:5000`);

                    resolve({
                        app,
                        server
                    });
                });
            });
        };

        async function createOAuthClient(){
            const credentials = require("../apiKeys/google-youtube.json").web;
            
            const OAuthClient = new OAuth2(
                credentials.client_id,
                credentials.client_secret,
                credentials.redirect_uris[0]
            );

            return OAuthClient;
        };

        async function requestUserConsent(OAuthClient, content){
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: "offline",
                scope: ["https://www.googleapis.com/auth/youtube"]
            });

            if(content.lang === "en"){
                return console.log(`>Please give your consent: ${consentUrl}`)
            } else {
                return console.log(`>Por favor, dê o seu consentimento: ${consentUrl}`);
            };
            
        };

        async function waitForGoogleCallBack(webServer, content){
            return new Promise((resolve, reject) => {

                console.log("> Waiting for user consent...");
              
                webServer.app.get("/oauth2callback", (req, res) => {
                    const authCode = req.query.code;
                    console.log(`> Consent given: ${authCode}`);

                    res.send("<h1>Thank you!</h1><p>Now close this tab.</p>");

                    resolve(authCode);
                });
                
            });
        };

        async function requestGoogleForAccessTokens(OAuthClient, authorizationToken) {
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if (error) {
                        return reject(error);
                    };

                    console.log("> Acess tokens received:");
                    console.log(tokens);

                    OAuthClient.setCredentials(tokens);
                    resolve();
                });
            });
        };
        
        async function setGlobalGoogleAuthentication() {
            google.options({
                auth: OAuthClient
            })
        };

        async function stopWebServer(){
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve();
                });
            });
        };
    };
};

module.exports = youtubeRobot;
