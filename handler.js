require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');

const crudRoutes = require('./src/routes/crudRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
app.use('/pedidos', pedidoRoutes);

const app = express();
app.use(express.json());


app.use('/clientes', clienteRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Shoe Repair Lambda funcionando!' });
});

module.exports.handler = serverless(app);
