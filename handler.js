require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');


const clienteRoutes = require('./src/routes/clienteRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const authRoutes = require('./src/routes/authRoutes');
const statusRoutes = require('./src/routes/statusRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/clientes', clienteRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/upload', uploadRoutes);
app.use('/auth', authRoutes);
app.use('/status', statusRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Shoe Repair Lambda funcionando!' });
});

// Exporta o app para uso local
module.exports = app;

// Exporta o handler para AWS Lambda
module.exports.handler = serverless(app);
