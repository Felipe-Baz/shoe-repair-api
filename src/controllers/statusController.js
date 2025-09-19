const statusByRole = {
  admin: {
    "Atendimento - Recebido": [],
    "Atendimento - Orçado": [],
    "Atendimento - Aprovado": [],
    "Lavagem - A Fazer": [],
    "Lavagem - Em Andamento": [],
    "Lavagem - Concluído": [],
    "Pintura - A Fazer": [],
    "Pintura - Em Andamento": [],
    "Pintura - Concluído": [],
    "Atendimento - Finalizado": [],
    "Atendimento - Entregue": []
  },
  lavagem: {
    "Lavagem - A Fazer": [],
    "Lavagem - Em Andamento": [],
    "Lavagem - Concluído": []
  },
  pintura: {
    "Pintura - A Fazer": [],
    "Pintura - Em Andamento": [],
    "Pintura - Concluído": []
  },
  atendimento: {
    "Atendimento - Recebido": [],
    "Atendimento - Orçado": [],
    "Atendimento - Aprovado": [],
    "Atendimento - Finalizado": [],
    "Atendimento - Entregue": []
  }
};

exports.getStatusColumns = async (req, res) => {
  try {
    const { role } = req.user || {};
    
    if (!role) {
      return res.status(403).json({ 
        success: false, 
        error: 'Role do usuário não encontrada.' 
      });
    }

    const columns = statusByRole[role.toLowerCase()];
    
    if (!columns) {
      return res.status(403).json({ 
        success: false, 
        error: 'Role não autorizada.' 
      });
    }

    res.json({
      success: true,
      data: columns
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};