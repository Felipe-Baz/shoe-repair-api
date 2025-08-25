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
    const { userId, pedidoId } = req.body;
    if (!userId || !pedidoId) {
      return res.status(400).json({ error: 'userId e pedidoId são obrigatórios no body.' });
    }
    const uploadedUrls = [];
    for (const file of req.files) {
      const params = {
        Bucket: bucket,
        Key: `User/${userId}/pedidos/${pedidoId}/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const data = await s3.upload(params).promise();
      uploadedUrls.push(data.Location);
    }

    // Atualiza o pedido no DynamoDB com as URLs das imagens
    const pedidoService = require('../services/pedidoService');
    await pedidoService.updatePedido(pedidoId, { fotos: uploadedUrls });

    res.json({ urls: uploadedUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
