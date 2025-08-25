// Modelo de pedido para shoe repair
module.exports = {
  id: String,
  clienteId: String,
  modeloTenis: String,
  tipoServico: String, // Enum
  descricaoServicos: String,
  fotos: [String], // URLs do S3
  preco: Number,
  dataPrevistaEntrega: String, // ISO date
  status: String // Enum
};
