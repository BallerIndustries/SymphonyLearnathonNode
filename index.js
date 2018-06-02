const Symphony = require('symphony-api-client-node');
const express = require('express');
const request = require('request');
const app = express();

Symphony.initBot(__dirname + '/config.json').then((symphonyAuth) => {
    // Find Naeem
    findUser('naeem.ahmed@gmail.com', symphonyAuth.sessionAuthToken, function(error, users) {
        const userObject = JSON.parse(users);
        userObject.users.forEach(user => { console.log(`Found ${user.displayName}`)});
    });
}).fail((error) => {
    console.log(error);
});

function findUser(email, sessionToken, callback) {
    const url = `https://develop2.symphony.com/pod/v3/users?email=${email}&local=false`;
    const headers = {
        sessionToken: sessionToken
    };

    const options = {
        url: url,
        headers: headers,
    };

    request(options, function(error, response, body) {
        if (error) {
            return callback(error)
        }

        callback(null, body);
    })
}

app.listen(3000, () => console.log('Example app listening on port 3000!'));