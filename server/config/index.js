require('dotenv').load();
module.exports = {
  slack_token: process.env.SLACK_TOKEN,
  port: process.env.PORT,
  db: process.env.DB_URL
};
