// utils/oauth1a.js
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const getAuthHeader = (method, url) => {
  const oauth = OAuth({
    consumer: {
      key: process.env.NETSUITE_CONSUMER_KEY,
      secret: process.env.NETSUITE_CONSUMER_SECRET,
    },
    signature_method: 'HMAC-SHA256',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha256', key)
        .update(base_string)
        .digest('base64');
    },
  });

  const token = {
    key: process.env.NETSUITE_TOKEN_ID,
    secret: process.env.NETSUITE_TOKEN_SECRET,
  };

  const request_data = {
    url,
    method,
  };

  const authHeader = oauth.toHeader(oauth.authorize(request_data, token));
  authHeader.Authorization += `, realm="${process.env.NETSUITE_ACCOUNT_ID}"`;

  return authHeader;
};

module.exports = { getAuthHeader };
