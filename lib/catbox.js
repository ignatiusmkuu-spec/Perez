const fs = require('fs');
const uploadToPone = require('./pone');

async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Unable to find the file');
  }
  try {
    return await uploadToPone(filePath);
  } catch (poneError) {
    try {
      const { Catbox } = require('node-catbox');
      return await new Catbox().uploadFile({ path: filePath });
    } catch (catboxError) {
      throw new Error(`An error occurred during upload: ${poneError.message}`);
    }
  }
}

module.exports = uploadToCatbox;
