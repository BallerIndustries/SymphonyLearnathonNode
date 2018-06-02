const SymphonyTransport = require('../transport/SymphonyTransport');
const expect = require('chai').expect;

describe('SymphonyTransport Smoke Tests', async () => {

    // TODO: Remove intentional 'test interaction'
    let sessionToken = null;
    let kmToken = null;

    it('should be able to create a room', async function () {
        await authenticate();

        const name = 'The Bestest Room ' + generateRandomString();
        const description = 'A room people consider to be the best';
        const membersCanInvite = false;
        const discoverable = true;
        const isPublic = false;
        const readOnly = false;
        const copyProtected = false;
        const crossPod = false;
        const viewHistory = false;

        const response = await SymphonyTransport.createRoom(sessionToken, name, description, membersCanInvite,
            discoverable, isPublic, readOnly, copyProtected, crossPod, viewHistory);

        expect(response).to.exist;
    }).timeout(10000);

    it('should be able to authenticate', async function() {
        const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
        expect(response.sessionToken).to.exist;
        expect(response.kmToken).to.exist;
    }).timeout(10000);

    it('should be able to find Angus', async function() {
        await authenticate();
        const users = await SymphonyTransport.findUser('commandercheng@gmail.com', sessionToken);
        expect(users.map(it => it.displayName)).to.deep.equal(['Angus Cheng']);
    }).timeout(10000);

    it('should be able to send a message to a stream', async function() {
        await authenticate();
        const streamId = 'rbIAUYjNlM/r3ygrT086LX///pw+4ef7dA==';
        const message = '<messageML>Hello world!</messageML>';
        await SymphonyTransport.sendMessage(sessionToken, kmToken, streamId, message);
    }).timeout(10000);

    it('should be able to get session info', async function() {
        await authenticate();
        const response = await SymphonyTransport.getSessionInfo(sessionToken);
        expect(response.company).to.exist;
        expect(response.avatars).to.exist;
        expect(response.displayName).to.exist;
        expect(response.emailAddress).to.exist;
        expect(response.id).to.exist;
        expect(response.username).to.exist;
    }).timeout(10000);

    const generateRandomString = () => Math.random().toString(36).substring(7);

    async function authenticate() {
        if (sessionToken === null || kmToken === null) {
            const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
            sessionToken = response.sessionToken;
            kmToken = response.kmToken;
        }
    }
});

