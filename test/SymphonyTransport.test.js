const SymphonyTransport = require('../transport/SymphonyTransport');
const expect = require('chai').expect;

describe('SymphonyTransport Smoke Tests', async () => {

    // TODO: Remove intentional 'test interaction'
    let sessionToken = null;
    let kmToken = null;

    it('should be able to create a room, add Angus and then listen to messages', async function () {
        this.timeout(10000);
        await authenticate();

        // Create a room
        const createRoomResponse = await createRoom();

        // Add in Angus
        const users = await SymphonyTransport.findUser(['commandercheng@gmail.com'], sessionToken);
        const streamId = createRoomResponse.roomSystemInfo.id;

        const addUserPromises = users.map(user => SymphonyTransport.addUser(sessionToken, streamId, user.id));
        await Promise.all(addUserPromises);

        // Listen to messages in that room
        const since = 0;
        const messages = await SymphonyTransport.getMessages(sessionToken, kmToken, since, streamId);

        expect(messages).to.exist
    });

    it('should be able to send a message to a stream', async function() {
        this.timeout(10000);
        await authenticate();
        const response = await sendMessages();
        expect(response).to.exist;
    });

    it('should be able to find Angus, Eric, and Naeem', async function() {
        this.timeout(10000);
        await authenticate();

        const emails = ['commandercheng@gmail.com', 'eric.vergnaud@credit-suisse.com', 'naeem.ahmed@gmail.com' ];
        const users = await SymphonyTransport.findUser(emails, sessionToken);
        expect(users.map(it => it.displayName)).to.deep.equal(['Naeem Ahmed', 'Eric Vergnaud', 'Angus Cheng']);
    });

    it('should be able to create a room and add Angus into it', async function () {
        this.timeout(10000);
        await authenticate();
        const createRoomResponse = await createRoom();

        expect(createRoomResponse).to.exist;

        const users = await SymphonyTransport.findUser(['commandercheng@gmail.com'], sessionToken);
        const streamId = createRoomResponse.roomSystemInfo.id;

        const addUserPromises = users.map(user => SymphonyTransport.addUser(sessionToken, streamId, user.id));
        const addUserResponses = await Promise.all(addUserPromises);

        expect(addUserResponses).to.deep.equal([{format: 'TEXT', message: 'Member added'}])
    });

    it('should be able to authenticate', async function() {
        this.timeout(10000);
        const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
        expect(response.sessionToken).to.exist;
        expect(response.kmToken).to.exist;
    });

    it('should be able to get session info', async function() {
        this.timeout(10000);
        await authenticate();
        const response = await SymphonyTransport.getSessionInfo(sessionToken);
        expect(response.company).to.exist;
        expect(response.avatars).to.exist;
        expect(response.displayName).to.exist;
        expect(response.emailAddress).to.exist;
        expect(response.id).to.exist;
        expect(response.username).to.exist;
    });

    it('should be able to read messages from a stream', async function() {
        this.timeout(10000);
        await authenticate();
        const since = 0;
        const streamId = 'uAGffU2cdpFBD+wfQInTvn///pw7jf1bdA==';
        const messages = await SymphonyTransport.getMessages(sessionToken, kmToken, since, streamId);
        expect(messages.length).to.be.gt(0);
    });

    const generateRandomString = () => Math.random().toString(36).substring(7);

    async function authenticate() {
        if (sessionToken === null || kmToken === null) {
            const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
            sessionToken = response.sessionToken;
            kmToken = response.kmToken;
        }
    }

    async function sendMessages() {
        const streamId = 'uAGffU2cdpFBD+wfQInTvn///pw7jf1bdA==';
        const message = '<messageML>Good Afternoon Angus!</messageML>';
        return SymphonyTransport.sendMessage(sessionToken, kmToken, streamId, message);
    }

    async function createRoom() {
        const name = 'The Bestest Room ' + generateRandomString();
        const description = 'A room people consider to be the best';
        const membersCanInvite = false;
        const discoverable = true;
        const isPublic = false;
        const readOnly = false;
        const copyProtected = false;
        const crossPod = false;
        const viewHistory = true;

        return SymphonyTransport.createRoom(sessionToken, name, description, membersCanInvite,
            discoverable, isPublic, readOnly, copyProtected, crossPod, viewHistory);
    }
});

