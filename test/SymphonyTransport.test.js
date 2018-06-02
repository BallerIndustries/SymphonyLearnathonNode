const SymphonyTransport = require('../transport/SymphonyTransport');
const expect = require('chai').expect;

describe('SymphonyTransport Smoke Tests', () => {

    it('should be able to authenticate', async function () {
        const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
        expect(response.sessionToken).to.exist;
        expect(response.kmToken).to.exist;
    }).timeout(10000);

    it('should be able to find Angus', async function () {
        const response = await SymphonyTransport.authenticate(__dirname + '/../config.json');
        const users = await SymphonyTransport.findUser('commandercheng@gmail.com', response.sessionToken);
        expect(users.map(it => it.displayName)).to.deep.equal(['Angus Cheng']);
    }).timeout(10000);
});