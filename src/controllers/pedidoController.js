const pedidoService = require('../services/pedidoService');
const { enviarStatusPedido } = require('../services/whatsappService');
const pdfService = require('../services/pdfService');

exports.listPedidosStatus = async (req, res) => {
  try {
    const { role, sub: userId } = req.user || {};
    let pedidos = await pedidoService.listPedidos();
    
    // Filtrar pedidos baseado no cargo do usuário
    switch (role?.toLowerCase()) {
      case 'admin':
        // Admin vê todos os pedidos
        break;
      case 'lavagem':
        // Lavagem vê pedidos em "Lavagem - *" + pedidos vindos do atendimento
        pedidos = pedidos.filter(p => 
          p.status?.startsWith('Lavagem - ') || 
          p.status === 'Atendimento - Aprovado'
        );
        break;
      case 'pintura':
        // Pintura vê pedidos em "Pintura - *" + pedidos vindos da lavagem
        pedidos = pedidos.filter(p => 
          p.status?.startsWith('Pintura - ') || 
          p.status === 'Lavagem - Concluído'
        );
        break;
      case 'atendimento':
        // Atendimento vê todos os pedidos (para acompanhamento)
        break;
      default:
        return res.status(403).json({ 
          success: false, 
          error: 'Acesso negado.' 
        });
    }

    // Transformar pedidos para o formato esperado pelo frontend
    const pedidosFormatados = pedidos.map(pedido => ({
      id: pedido.id,
      clientName: pedido.nomeCliente || pedido.clientName,
      clientCpf: pedido.cpfCliente || pedido.clientCpf,
      sneaker: pedido.modeloTenis || pedido.sneaker,
      serviceType: pedido.tipoServico || pedido.serviceType,
      description: pedido.descricaoServicos || pedido.description,
      price: pedido.preco || pedido.price || pedido.precoTotal,
      servicos: pedido.servicos.map(servico => servico.nome).join(', '),
      status: pedido.status,
      createdDate: pedido.dataCriacao || pedido.createdDate,
      expectedDate: pedido.dataPrevistaEntrega || pedido.expectedDate,
      statusHistory: pedido.statusHistory || [
        {
          status: pedido.status,
          date: pedido.dataCriacao || new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          userId: userId,
          userName: req.user?.email || 'Sistema'
        }
      ],
      clientId: pedido.clienteId || pedido.clientId,
      modeloTenis: pedido.modeloTenis,
      tipoServico: pedido.tipoServico,
      descricaoServicos: pedido.descricaoServicos,
      preco: pedido.preco,
      dataPrevistaEntrega: pedido.dataPrevistaEntrega,
      dataCriacao: pedido.dataCriacao,
      fotos: pedido.fotos || [],
      observacoes: pedido.observacoes
    }));

    res.status(200).json({
      success: true,
      data: pedidosFormatados
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

exports.listPedidos = async (req, res) => {
  try {
    let pedidos = await pedidoService.listPedidos();
    // Sempre retorna 200, nunca 304
    res.status(200).json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPedido = async (req, res) => {
  try {
    const pedido = await pedidoService.getPedido(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(200).json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPedido = async (req, res) => {
  try {
    const { 
      clienteId, 
      modeloTenis, 
      servicos, 
      fotos, 
      precoTotal, 
      dataPrevistaEntrega, 
      departamento, 
      observacoes,
      status
    } = req.body;

    // Validação básica
    if (!clienteId || !modeloTenis || !servicos || !Array.isArray(servicos) || servicos.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campos obrigatórios: clienteId, modeloTenis e servicos (array não vazio)' 
      });
    }

    // Validar estrutura dos serviços
    for (const servico of servicos) {
      if (!servico.id || !servico.nome || typeof servico.preco !== 'number') {
        return res.status(400).json({ 
          success: false, 
          error: 'Cada serviço deve ter: id, nome e preco (número)' 
        });
      }
    }

    const { role, sub: userId, email: userEmail } = req.user || {};

    // Estruturar dados do pedido
    const dadosPedido = {
      clienteId,
      modeloTenis,
      servicos,
      fotos: fotos || [],
      precoTotal: precoTotal || servicos.reduce((total, servico) => total + servico.preco, 0),
      dataPrevistaEntrega,
      departamento: departamento || 'Atendimento',
      observacoes: observacoes || '',
      status: status || 'Atendimento - Orçado',
      dataCriacao: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: status || 'Atendimento - Orçado',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          userId: userId || 'sistema',
          userName: userEmail || 'Sistema'
        }
      ]
    };

    const novoPedido = await pedidoService.createPedido(dadosPedido);
    
    res.status(201).json({
      success: true,
      data: novoPedido,
      message: 'Pedido criado com sucesso'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

exports.updatePedido = async (req, res) => {
  try {
    const atualizado = await pedidoService.updatePedido(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(200).json(atualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePedido = async (req, res) => {
  try {
    const deletado = await pedidoService.deletePedido(req.params.id);
    if (!deletado) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(200).json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePedidoStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { role, sub: userId, email: userEmail } = req.user || {};
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status é obrigatório' 
      });
    }

    // Validar permissões baseado no cargo
    const canUpdateStatus = (userRole, newStatus) => {
      switch (userRole?.toLowerCase()) {
        case 'admin':
          return true; // Admin pode alterar qualquer status
        case 'lavagem':
          return newStatus.startsWith('Lavagem - ');
        case 'pintura':
          return newStatus.startsWith('Pintura - ');
        case 'atendimento':
          return newStatus.startsWith('Atendimento - ');
        default:
          return false;
      }
    };

    if (!canUpdateStatus(role, status)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Usuário não tem permissão para alterar para este status' 
      });
    }

    // Buscar pedido atual para pegar o histórico
    const pedidoAtual = await pedidoService.getPedido(req.params.id);
    if (!pedidoAtual) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    // Criar novo item do histórico
    const novoHistorico = {
      status: status,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      userId: userId,
      userName: userEmail || 'Sistema'
    };

    // Atualizar histórico
    const statusHistory = pedidoAtual.statusHistory || [];
    statusHistory.push(novoHistorico);

    // Atualizar pedido com novo status e histórico
    const updates = {
      status: status,
      statusHistory: statusHistory,
      updatedAt: new Date().toISOString()
    };

    const atualizado = await pedidoService.updatePedido(req.params.id, updates);
    
    if (!atualizado) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    // Enviar notificação via WhatsApp se os dados necessários estiverem disponíveis
    if (atualizado.telefoneCliente && atualizado.nomeCliente) {
      try {
        const { telefoneCliente, nomeCliente, descricaoServicos, modeloTenis } = atualizado;
        await enviarStatusPedido(telefoneCliente, nomeCliente, status, descricaoServicos, modeloTenis);
      } catch (whatsappError) {
        console.error('Erro ao enviar WhatsApp:', whatsappError);
        // Não falha a requisição se o WhatsApp der erro
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: atualizado.id,
        status: atualizado.status,
        statusHistory: atualizado.statusHistory,
        updatedAt: atualizado.updatedAt
      },
      message: 'Status atualizado com sucesso'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// POST /pedidos/document/pdf - Gerar PDF do pedido
exports.generatePedidoPdf = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    
    if (!pedidoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do pedido é obrigatório'
      });
    }

    // Verificar se o usuário tem permissão (autenticado)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    console.log('Iniciando geração de PDF para pedido:', pedidoId);

    // Tentar primeiro o PDF completo
    let pdfResult;
    try {
      pdfResult = await pdfService.generatePedidoPdf(pedidoId);
      console.log('PDF complexo gerado com sucesso');
    } catch (complexError) {
      console.error('Erro no PDF complexo, tentando versão simplificada:', complexError.message);
      
      // Buscar dados do pedido para obter clienteId para o fallback
      let clienteId = 'unknown';
      try {
        const pedidoService = require('../services/pedidoService');
        const pedido = await pedidoService.getPedido(pedidoId);
        if (pedido && pedido.clienteId) {
          clienteId = pedido.clienteId;
        }
      } catch (err) {
        console.warn('Não foi possível obter clienteId para fallback:', err.message);
      }
      
      pdfResult = await pdfService.generateSimplePdf(pedidoId, clienteId);
      console.log('PDF simplificado gerado como fallback');
    }

    // Extrair buffer e informações do S3
    const pdfBuffer = pdfResult.buffer || pdfResult; // Compatibilidade com versão antiga
    const s3Info = pdfResult.s3;

    // Definir headers para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="pedido-${pedidoId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Adicionar informações do S3 no header (se disponível)
    if (s3Info) {
      res.setHeader('X-S3-URL', s3Info.url);
      res.setHeader('X-S3-Key', s3Info.key);
      console.log('PDF também disponível em:', s3Info.url);
    }

    // Enviar o PDF como blob
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar PDF do pedido:', error);
    
    // Verificar se é erro de pedido não encontrado
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao gerar PDF',
      error: error.message
    });
  }
};

// GET /pedidos/:id/pdfs - Listar PDFs salvos no S3 para um pedido
exports.listPedidoPdfs = async (req, res) => {
  try {
    const { id: pedidoId } = req.params;
    
    if (!pedidoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do pedido é obrigatório'
      });
    }

    // Verificar se o usuário tem permissão
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar dados do pedido para obter clienteId
    const pedidoService = require('../services/pedidoService');
    const pedido = await pedidoService.getPedido(pedidoId);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    const AWS = require('aws-sdk');
    const s3 = new AWS.S3();
    const bucket = process.env.S3_BUCKET_NAME;
    
    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'Bucket S3 não configurado'
      });
    }

    // Listar PDFs do pedido no S3
    const prefix = `User/${pedido.clienteId}/pedidos/${pedidoId}/pdf/`;
    const listParams = {
      Bucket: bucket,
      Prefix: prefix
    };

    const result = await s3.listObjectsV2(listParams).promise();
    
    const pdfs = result.Contents.map(obj => ({
      key: obj.Key,
      lastModified: obj.LastModified,
      size: obj.Size,
      url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
      filename: obj.Key.split('/').pop()
    }));

    res.json({
      success: true,
      data: {
        pedidoId: pedidoId,
        clienteId: pedido.clienteId,
        pdfs: pdfs
      }
    });

  } catch (error) {
    console.error('Erro ao listar PDFs do pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar PDFs',
      error: error.message
    });
  }
};
