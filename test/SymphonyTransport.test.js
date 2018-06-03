const SymphonyTransport = require('../transport/SymphonyTransport');
const expect = require('chai').expect;

describe('SymphonyTransport Smoke Tests', async () => {

    // TODO: Remove intentional 'test interaction'
    let sessionToken = null;
    let kmToken = null;

    it('should be able to send a message to a stream', async function() {
        await authenticate();
        const streamId = 'asTVaSUAmG3ASQBLkHAqhn///pw7qflXdA==';
        const message = '<messageML>Good Afternoon Angus!</messageML>';
        await SymphonyTransport.sendMessage(sessionToken, kmToken, streamId, message);
    }).timeout(10000);

    it('should be able to find Angus, Eric, and Naeem', async function() {
        await authenticate();

        const emails = ['commandercheng@gmail.com', 'eric.vergnaud@credit-suisse.com', 'naeem.ahmed@gmail.com' ];
        const users = await SymphonyTransport.findUser(emails, sessionToken);
        expect(users.map(it => it.displayName)).to.deep.equal(['Naeem Ahmed', 'Eric Vergnaud', 'Angus Cheng']);
    }).timeout(10000);

    it('should be able to create a room and add Angus into it', async function () {
        await authenticate();

        const name = 'The Bestest Room ' + generateRandomString();
        const description = 'A room people consider to be the best';
        const membersCanInvite = false;
        const discoverable = true;
        const isPublic = false;
        const readOnly = false;
        const copyProtected = false;
        const crossPod = false;
        const viewHistory = true;

        const createRoomResponse = await SymphonyTransport.createRoom(sessionToken, name, description, membersCanInvite,
            discoverable, isPublic, readOnly, copyProtected, crossPod, viewHistory);

        expect(createRoomResponse).to.exist;

        const users = await SymphonyTransport.findUser(['commandercheng@gmail.com'], sessionToken);
        const streamId = createRoomResponse.roomSystemInfo.id;

        const addUserPromises = users.map(user => SymphonyTransport.addUser(sessionToken, streamId, user.id));
        const addUserResponses = await Promise.all(addUserPromises);

        expect(addUserResponses).to.deep.equal([{format: 'TEXT', message: 'Member added'}])
    }).timeout(10000);

    it('should be able to authenticate', async function() {
        const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
        expect(response.sessionToken).to.exist;
        expect(response.kmToken).to.exist;
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

