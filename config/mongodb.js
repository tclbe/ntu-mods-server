const mongoose = require('mongoose');

const USER = 'caleb';
const PASS = 'QvPyTK97O9Oh3f2v';
const SERVER = 'cluster0.lwhw4.gcp.mongodb.net/ntu?retryWrites=true&w=majority';
const uri = `mongodb+srv://${USER}:${PASS}@${SERVER}`;

function createConnection(modelName) {
  let conn = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  conn.connectedBefore = false;
  conn.connectionRetries = 5;

  conn.on('connected', () => {
    conn.connectedBefore = true;
    console.log(
      `${modelName} connected, ${mongoose.connections.length} live connections (including default).`
    );
  });

  conn.on('disconnected', () => {
    if (conn.connectionRetries > 0) {
      console.log(
        `${modelName} retrying connection, ${conn.connectionRetries} tr${
          conn.connectionRetries === 1 ? 'y' : 'ies'
        } remaining.`
      );
      conn.openUri(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      conn.connectionRetries -= 1;
    } else {
      throw new Error(`${modelName} could not connect after 5 tries.`);
    }
  });

  conn.on('error', async (err) => {
    console.log(`${modelName} connection error.`);
    // console.error(err)
    await conn.close();
    console.log(`${modelName} disconnected.`);
  });

  conn.on('reconnected', () => console.log(`${modelName} reconnected.`));
  return conn;
}

module.exports = createConnection;
