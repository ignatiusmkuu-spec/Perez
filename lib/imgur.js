const fs = require('fs');
const uploadToPone = require('./pone');

async function uploadtoimgur(imagepath) {
  try {
    return await uploadToPone(imagepath);
  } catch (poneError) {
    try {
      const { ImgurClient } = require('imgur');
      const client = new ImgurClient({ clientId: 'a0113354926015a' });
      const response = await client.upload({ image: fs.createReadStream(imagepath), type: 'stream' });
      return response.data.link;
    } catch (imgurError) {
      throw new Error(`Image upload failed: ${poneError.message}`);
    }
  }
}

module.exports = uploadtoimgur;
