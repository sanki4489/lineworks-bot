const fs = require("node:fs");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// ---- 認証情報 ----
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const serverAccount = process.env.SERVICE_ACCOUNT;
const privateKeyFile = "./private_20241021135308.key";

/**
 * サーバーアカウント認証に使う JWT を返します
 * @returns Server Account JWT
 */
function getServerAccountJWT() {
  const payload = {
    iss: clientId,
    sub: serverAccount,
    iat: Date.now(),
    exp: Date.now() + 3600,
  };

  const privatePem = fs.readFileSync(privateKeyFile, "utf-8");
  const token = jwt.sign(payload, privatePem, { algorithm: "RS256" });

  // console.debug("Server Account JWT", token);

  return token;
}

/**
 * サーバーアカウント認証してアクセストークンを取得します
 * @returns アクセストークン
 */
async function getAccessToken() {
  const jwt = getServerAccountJWT();

  // @see https://axios-http.com/docs/urlencoded
  // @see https://developers.worksmobile.com/jp/reference/authorization-sa
  const params = new URLSearchParams({
    assertion: jwt,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "bot",
  });

  const response = await axios.post("https://auth.worksmobile.com/oauth2/v2.0/token", params);
  // console.debug("Token Response", response.data);

  const { access_token } = response.data;
  // console.debug("Access Token", access_token);

  return access_token;
}

module.exports = {
  getAccessToken,
};
