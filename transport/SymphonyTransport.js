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

module.exports.getSessionInfo = async function getSessionInfo(sessionToken) {
    const url = `https://develop2.symphony.com/pod/v2/sessioninfo`;
    const headers = {
        sessionToken: sessionToken
    };

    const options = {
        url: url,
        headers: headers,
    };

    const responseJson = await rp(options);
    return JSON.parse(responseJson);
};

module.exports.createRoom =
    async function getSessionInfo(sessionToken, name, description, membersCanInvite, discoverable, isPublic, readOnly,
                                  copyProtected, crossPod, viewHistory) {
    const url = `https://develop2.symphony.com/pod/v3/room/create`;
    const headers = {
        'sessionToken': sessionToken,
        'Content-Type': 'application/json',
    };

    const body = {
        'name': name,
        'description': description,
        'membersCanInvite': membersCanInvite,
        'discoverable': discoverable,
        'public': isPublic,
        'readOnly': readOnly,
        'copyProtected': copyProtected,
        'crossPod': crossPod,
        'viewHistory': viewHistory
    };

    const options = {
        url: url,
        headers: headers,
        method: 'POST',
        body: JSON.stringify(body)
    };

    const responseJson = await rp(options);
    return JSON.parse(responseJson);
};

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

async function sendMessage(sessionToken, keyManagerToken, streamId, message) {
    const url = `https://develop2.symphony.com/agent/v4/stream/${streamId}/message/create`;
    const headers = {
        sessionToken: sessionToken,
        keyManagerToken: keyManagerToken,
        contentType: 'multipart/form-data'
    };

    const body = {
        message: message
    };

    const options = {
        url: url,
        headers: headers,
        body: JSON.stringify(body),
        method: 'POST'
    };

    const responseJson = await rp(options);
    return JSON.parse(responseJson);
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
module.exports.sendMessage = sendMessage;