
module.exports = function (data) {
    const results = [];
    const requests = extractRequests(data);

    for (const request of requests) {
        results.push(importRequest(request));
    }

    return results;
};

function importRequest (request) {
    return {url: request.url};
}

function extractRequests (harRoot) {
    const log = harRoot.log;
    if (!log) {
        throw new Error('Missing "log" property')
    }

    const entries = log.entries;
    if (!entries) {
        throw new Error('Missing "entries" property of "log"')
    }

    const requests = [];
    for (const entry of entries) {
        const request = entry.request;

        if (!request) {
            throw new Error('Missing "request" property in of "entries"')
        }

        requests.push(request);
    }

    return requests;
}
