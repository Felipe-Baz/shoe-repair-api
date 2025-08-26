const pedidoService = require('../services/pedidoService');
const { enviarStatusPedido } = require('./whatsappService');

exports.listPedidos = async (req, res) => {
  try {
    const pedidos = await pedidoService.listPedidos();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPedido = async (req, res) => {
  try {
    const pedido = await pedidoService.getPedido(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPedido = async (req, res) => {
  try {
    const novoPedido = await pedidoService.createPedido(req.body);
    res.status(201).json(novoPedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePedido = async (req, res) => {
  try {
    const atualizado = await pedidoService.updatePedido(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePedido = async (req, res) => {
  try {
    const deletado = await pedidoService.deletePedido(req.params.id);
    if (!deletado) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePedidoStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }
    const atualizado = await pedidoService.updatePedidoStatus(req.params.id, status);
    if (!atualizado) return res.status(404).json({ error: 'Pedido não encontrado' });
    const { telefoneCliente, nomeCliente, descricaoServicos, modeloTenis } = atualizado;
    await enviarStatusPedido(telefoneCliente, nomeCliente, status, descricaoServicos, modeloTenis);
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
