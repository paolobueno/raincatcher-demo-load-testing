'use strict';
/**
 *
 * @param {object} lr - load-runner instance
 * @param {object} rp - configured request-promise instance
 * @param {string} app - The cloud app to login to
 * @param {string} user - The user to login as
 * @param {string} pass - The password to login with
 * @returns {promise} A promise that resolves with a session token
 */
module.exports = function login(lr, rp, app, user, pass) {

  const reqBody = {
    "params": {
      "userId": user,
      "password": pass
    }
  };

  return new Promise(resolve => {
    lr.actStart('Login');
    return rp.post({
      url: `${app}/box/srv/1.1/admin/authpolicy/auth`,
      body: reqBody,
      json: true
    }).then(resBody => {
      lr.actEnd('Login');
      return resolve(resBody.sessionToken);
    });
  });
};
