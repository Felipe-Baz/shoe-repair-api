// Modelo de pedido para shoe repair
module.exports = {
  id: String,
  clienteId: String,
  modeloTenis: String,
  servicos: [{ // Nova estrutura de serviços
    id: String,
    nome: String,
    preco: Number,
    descricao: String
  }],
  fotos: [String], // URLs do S3
  precoTotal: Number, // Novo campo
  dataPrevistaEntrega: String, // ISO date
  departamento: String, // Novo campo
  observacoes: String, // Novo campo
  status: String, // Enum
  dataCriacao: String, // ISO date
  createdAt: String, // ISO date
  updatedAt: String, // ISO date
  statusHistory: [{ // Novo campo para histórico
    status: String,
    date: String,
    time: String,
    userId: String,
    userName: String
  }],
  // Campos antigos mantidos para compatibilidade
  tipoServico: String, // Enum (deprecated)
  descricaoServicos: String, // (deprecated)
  preco: Number // (deprecated)
};
