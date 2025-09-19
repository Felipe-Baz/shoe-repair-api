const pedidoService = require('../services/pedidoService');
const { enviarStatusPedido } = require('../services/whatsappService');

exports.listPedidos = async (req, res) => {
  try {
    const { role, sub: userId } = req.user || {};
    let pedidos = await pedidoService.listPedidos();
    let statusPermitidos = [];
    switch (role) {
      case 'admin':
        // Admin pode ver todos os status
        break;
      case 'colagem':
        // departamento de Colagem só pode ver alguns status
        statusPermitidos = ['colagem_em_andamento', 'colagem_a_fazer', 'colagem_pronto'];
        pedidos = pedidos.filter(p => p.clienteId === userId && statusPermitidos.includes(p.status));
        break;
      case 'lavanderia':
        // departamento de Lavanderia só pode ver alguns status
        statusPermitidos = ['lavanderia_em_andamento', 'lavanderia_a_fazer', 'lavanderia_pronto'];
        pedidos = pedidos.filter(p => p.clienteId === userId && statusPermitidos.includes(p.status));
        break;
      default:
        return res.status(403).json({ error: 'Acesso negado.' });
    }
    // Se não for admin, filtra por statusPermitidos (admin vê todos)
    if (role === 'admin' && statusPermitidos.length > 0) {
      pedidos = pedidos.filter(p => statusPermitidos.includes(p.status));
    }
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
