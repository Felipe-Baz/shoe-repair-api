const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const pedidoService = require('./pedidoService');
const clienteService = require('./clienteService');

class PdfService {
  
  // Função para formatar data para exibição
  formatDate(dateString) {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Função para formatar valor monetário
  formatCurrency(value) {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Função principal para gerar PDF do pedido
  async generatePedidoPdf(pedidoId) {
    try {
      // Buscar dados do pedido
      const pedido = await pedidoService.getPedido(pedidoId);
      if (!pedido) {
        throw new Error(`Pedido com ID ${pedidoId} não encontrado`);
      }

      // Buscar dados do cliente
      const cliente = await clienteService.getCliente(pedido.clienteId);
      if (!cliente) {
        throw new Error(`Cliente com ID ${pedido.clienteId} não encontrado`);
      }

      // Criar documento PDF com configurações aprimoradas
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Configurar fonte padrão com suporte a caracteres especiais
      doc.setFont('helvetica', 'normal');
      
      // Função melhorada para texto com caracteres especiais
      const safeText = (text) => {
        if (!text) return '';
        return text
          .replace(/ç/g, 'c').replace(/Ç/g, 'C')
          .replace(/ã/g, 'a').replace(/Ã/g, 'A')
          .replace(/á/g, 'a').replace(/Á/g, 'A')
          .replace(/à/g, 'a').replace(/À/g, 'A')
          .replace(/â/g, 'a').replace(/Â/g, 'A')
          .replace(/ä/g, 'a').replace(/Ä/g, 'A')
          .replace(/é/g, 'e').replace(/É/g, 'E')
          .replace(/è/g, 'e').replace(/È/g, 'E')
          .replace(/ê/g, 'e').replace(/Ê/g, 'E')
          .replace(/ë/g, 'e').replace(/Ë/g, 'E')
          .replace(/í/g, 'i').replace(/Í/g, 'I')
          .replace(/ì/g, 'i').replace(/Ì/g, 'I')
          .replace(/î/g, 'i').replace(/Î/g, 'I')
          .replace(/ï/g, 'i').replace(/Ï/g, 'I')
          .replace(/ó/g, 'o').replace(/Ó/g, 'O')
          .replace(/ò/g, 'o').replace(/Ò/g, 'O')
          .replace(/ô/g, 'o').replace(/Ô/g, 'O')
          .replace(/õ/g, 'o').replace(/Õ/g, 'O')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ú/g, 'u').replace(/Ú/g, 'U')
          .replace(/ù/g, 'u').replace(/Ù/g, 'U')
          .replace(/û/g, 'u').replace(/Û/g, 'U')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
          .replace(/º/g, 'o').replace(/ª/g, 'a')
          .replace(/°/g, 'o');
      };

      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 90, 160); // Cor azul
      doc.text('SHOE REPAIR', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Ordem de Servico', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Linha separadora
      doc.setDrawColor(44, 90, 160);
      doc.setLineWidth(1);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      // Informações do Pedido
      doc.setFontSize(14);
      doc.setTextColor(44, 90, 160);
      doc.text('Informacoes do Pedido', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const pedidoInfo = [
        `No do Pedido: ${pedido.id}`,
        `Data de Criacao: ${this.formatDate(pedido.createdAt || pedido.dataCriacao)}`,
        `Data Prevista: ${this.formatDate(pedido.dataPrevistaEntrega)}`,
        `Status Atual: ${safeText(pedido.status || 'Nao informado')}`,
        `Departamento: ${safeText(pedido.departamento || 'Nao informado')}`
      ];

      pedidoInfo.forEach(info => {
        doc.text(info, 25, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Dados do Cliente
      doc.setFontSize(14);
      doc.setTextColor(44, 90, 160);
      doc.text('Dados do Cliente', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const clienteInfo = [
        `Nome: ${safeText(cliente.nome || 'Nao informado')}`,
        `CPF: ${cliente.cpf || 'Nao informado'}`,
        `Telefone: ${cliente.telefone || 'Nao informado'}`,
        `Email: ${cliente.email || 'Nao informado'}`,
        `Endereco: ${safeText(this.formatClienteEndereco(cliente))}`
      ];

      clienteInfo.forEach(info => {
        doc.text(info, 25, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Detalhes do Serviço
      doc.setFontSize(14);
      doc.setTextColor(44, 90, 160);
      doc.text('Detalhes do Servico', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Modelo do Tenis: ${safeText(pedido.modeloTenis || 'Nao informado')}`, 25, yPosition);
      yPosition += 10;

      // Serviços
      doc.text('Servicos Solicitados:', 25, yPosition);
      yPosition += 8;

      if (pedido.servicos && pedido.servicos.length > 0) {
        pedido.servicos.forEach(servico => {
          doc.text(`• ${safeText(servico.nome || 'Servico')} - ${this.formatCurrency(servico.preco)}`, 30, yPosition);
          if (servico.descricao) {
            yPosition += 5;
            doc.setFontSize(9);
            doc.text(`  ${safeText(servico.descricao)}`, 35, yPosition);
            doc.setFontSize(10);
          }
          yPosition += 6;
        });
      } else {
        doc.text(`• ${safeText(pedido.tipoServico || 'Servico nao especificado')} - ${this.formatCurrency(pedido.preco)}`, 30, yPosition);
        yPosition += 6;
      }

      yPosition += 5;

      // Total
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${this.formatCurrency(pedido.precoTotal || pedido.preco)}`, pageWidth - 60, yPosition, { align: 'right' });
      yPosition += 15;

      // Observações
      if (pedido.observacoes || pedido.descricaoServicos) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 90, 160);
        doc.text('Observacoes:', 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const observacoes = safeText(pedido.observacoes || pedido.descricaoServicos);
        const splitText = doc.splitTextToSize(observacoes, pageWidth - 40);
        doc.text(splitText, 25, yPosition);
        yPosition += splitText.length * 5 + 10;
      }

      // Histórico de Status (se há espaço)
      if (pedido.statusHistory && pedido.statusHistory.length > 0 && yPosition < pageHeight - 60) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 90, 160);
        doc.text('Historico de Status:', 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        pedido.statusHistory.slice(0, 5).forEach(item => { // Mostrar apenas os 5 mais recentes
          const statusText = `${safeText(item.status)} - ${this.formatDate(item.date)} ${item.time || ''}`;
          doc.text(statusText, 25, yPosition);
          yPosition += 5;
        });
      }

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Documento gerado em ${this.formatDate(new Date().toISOString())}`, 20, pageHeight - 20);
      doc.text('Shoe Repair - Sistema de Gerenciamento', pageWidth - 20, pageHeight - 20, { align: 'right' });

      // Retornar buffer do PDF
      return Buffer.from(doc.output('arraybuffer'));

    } catch (error) {
      console.error('Erro ao gerar PDF do pedido:', error);
      throw error;
    }
  }

  // Função auxiliar para formatar endereço do cliente
  formatClienteEndereco(cliente) {
    const enderecoParts = [];
    
    if (cliente.logradouro) enderecoParts.push(cliente.logradouro);
    if (cliente.numero) enderecoParts.push(`no ${cliente.numero}`);
    if (cliente.bairro) enderecoParts.push(cliente.bairro);
    if (cliente.cidade) enderecoParts.push(cliente.cidade);
    if (cliente.estado) enderecoParts.push(cliente.estado);
    if (cliente.cep) enderecoParts.push(`CEP: ${cliente.cep}`);
    
    return enderecoParts.length > 0 ? enderecoParts.join(', ') : 'Nao informado';
  }
}

module.exports = new PdfService();