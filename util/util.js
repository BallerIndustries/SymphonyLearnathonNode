module.exports.normaliseStreamId = function(streamId) {
    let buffer = '';

    for (let i = 0; i < streamId.length; i++) {
        if (streamId[i] === '/') {
            buffer += '_';
        }
        else if (streamId[i] === '+') {
            buffer += '-';
        }
        else if (streamId[i] !== '=') {
            buffer += streamId[i]
        }
    }

    return buffer;
};