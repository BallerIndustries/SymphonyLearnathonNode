const rp = require('request-promise');
const fs = require('fs');
const Q = require('kew');
const https = require('https');

async function authenticate(configPath) {
    const config = require(configPath);
    const sessionToken = await sessionAuthenticate(config);
    const kmToken = await kmAuthenticate(config);
    return { sessionToken, kmToken };
}

async function findUser(email, sessionToken) {
    const url = `https://develop2.symphony.com/pod/v3/users?email=${email}&local=false`;
    const headers = {
        sessionToken: sessionToken
    };

    const options = {
        url: url,
        headers: headers,
    };

    const responseJson = await rp(options);
    return JSON.parse(responseJson).users;
}

function sessionAuthenticate(symConfig) {
    const defer = Q.defer();

    const options = {
        "hostname": symConfig.sessionAuthHost,
        "port": symConfig.sessionAuthPort,
        "path": "/sessionauth/v1/authenticate",
        "method": "POST",
        "key": fs.readFileSync(symConfig.botCertPath + symConfig.botCertName, 'utf8'),
        "cert": fs.readFileSync(symConfig.botCertPath + symConfig.botCertName, 'utf8'),
        "passphrase": symConfig.botCertPassword,
        rejectUnauthorized: false
    };

    const req = https.request(options, function(res) {
        let str = '';
        res.on('data', function(chunk) {
            str += chunk;
        });
        res.on('end', function() {
            const SymSessionToken = JSON.parse(str);
            defer.resolve(SymSessionToken.token);
        });
    });

    req.end();

    return defer.promise;
}

function kmAuthenticate(symConfig) {
    const defer = Q.defer();

    const options = {
        "hostname": symConfig.keyAuthHost,
        "port": symConfig.keyAuthPort,
        "path": "/keyauth/v1/authenticate",
        "method": "POST",
        "key": fs.readFileSync(symConfig.botCertPath + symConfig.botCertName, 'utf8'),
        "cert": fs.readFileSync(symConfig.botCertPath + symConfig.botCertName, 'utf8'),
        "passphrase": symConfig.botCertPassword,
        rejectUnauthorized: false
    };

    const req = https.request(options, function(res) {
        let str = '';
        res.on('data', function(chunk) {
            str += chunk;
        });
        res.on('end', function() {
            const SymKmToken = JSON.parse(str);
            defer.resolve(SymKmToken.token);
        });
    });

    req.end();

    return defer.promise;
}

module.exports.findUser = findUser;
module.exports.authenticate = authenticate;