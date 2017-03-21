'use strict';

module.exports = function sync(request, url, body) {
  return request.post({
    url: url,
    body: body,
    json: true
  });
};
