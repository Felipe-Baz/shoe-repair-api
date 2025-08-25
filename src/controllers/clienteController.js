const clienteService = require('../services/clienteService');

exports.listClientes = async (req, res) => {
  try {
    const clientes = await clienteService.listClientes();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCliente = async (req, res) => {
  try {
    const cliente = await clienteService.getCliente(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCliente = async (req, res) => {
  try {
    const novoCliente = await clienteService.createCliente(req.body);
    res.status(201).json(novoCliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const atualizado = await clienteService.updateCliente(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const deletado = await clienteService.deleteCliente(req.params.id);
    if (!deletado) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
