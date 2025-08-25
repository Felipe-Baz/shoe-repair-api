const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.uploadFotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma foto enviada.' });
    }
    if (req.files.length > 5) {
      return res.status(400).json({ error: 'Máximo de 5 fotos permitido.' });
    }
    const bucket = process.env.S3_BUCKET_NAME;
    const uploadedUrls = [];
    for (const file of req.files) {
      const params = {
        Bucket: bucket,
        Key: `fotos/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };
      const data = await s3.upload(params).promise();
      uploadedUrls.push(data.Location);
    }
    res.json({ urls: uploadedUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
