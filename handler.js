require('dotenv').config();
const express = require('express');
const awsServerlessExpress = require('aws-serverless-express');

const clienteRoutes = require('./src/routes/clienteRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');

const app = express();
app.use(express.json());

app.use('/clientes', clienteRoutes);
app.use('/pedidos', pedidoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Shoe Repair Lambda funcionando!' });
});

// Exporta o app para uso local e para integração com Lambda (via adaptador, se necessário)
module.exports = app;

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
