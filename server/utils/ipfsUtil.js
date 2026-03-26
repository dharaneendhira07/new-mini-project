const axios = require('axios');
const FormData = require('form-data');

const uploadToIPFS = async (fileBuffer, fileName) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', fileBuffer, fileName);

    const res = await axios.post(url, data, {
        maxBodyLength: 'Infinity',
        headers: {
            ...data.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
        },
    });

    return res.data.IpfsHash;
};

module.exports = { uploadToIPFS };
