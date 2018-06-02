const { findUser, authenticate } = require('./transport/SymphonyTransport');
const express = require('express');
const app = express();

async function main() {
    app.listen(3000, () => console.log('Listening on port 3000!'));

    try {
        const response = await authenticate(__dirname + '/config.json');
        const users = await findUser('commandercheng@gmail.com', response.sessionToken);
        users.forEach(user => console.log(user.displayName));
    }
    catch (error) {
        console.log(error);
    }
}

main();