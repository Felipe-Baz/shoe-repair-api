const { jsPDF } = require('jspdf');
const pedidoService = require('./pedidoService');
const clienteService = require('./clienteService');
const AWS = require('aws-sdk');

// Configurar S3
const s3 = new AWS.S3();

class PdfService {
  
  // Função para fazer upload do PDF para S3
  async uploadPdfToS3(pdfBuffer, pedidoId, clienteId) {
    try {
      const bucket = process.env.S3_BUCKET_NAME;
      if (!bucket) {
        throw new Error('Bucket S3 não configurado');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const key = `User/${clienteId}/pedidos/${pedidoId}/pdf/pedido-${pedidoId}-${timestamp}.pdf`;
      
      const params = {
        Bucket: bucket,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ContentDisposition: `attachment; filename="pedido-${pedidoId}.pdf"`
      };

      console.log('Fazendo upload do PDF para S3:', key);
      const result = await s3.upload(params).promise();
      console.log('PDF enviado para S3 com sucesso:', result.Location);
      
      return {
        url: result.Location,
        key: key,
        bucket: bucket
      };
    } catch (error) {
      console.error('Erro ao fazer upload do PDF para S3:', error);
      throw error;
    }
  }
  
  // Método de teste para verificar se jsPDF está funcionando
  testPdfGeneration() {
    try {
      console.log('=== TESTE BÁSICO DO JSPDF ===');
      const doc = new jsPDF();
      doc.text('Teste básico', 20, 20);
      const buffer = Buffer.from(doc.output('arraybuffer'));
      console.log('Teste básico concluído. Buffer size:', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Erro no teste básico do jsPDF:', error);
      throw error;
    }
  }
  
  // Função para formatar data para exibição
  formatDate(dateString) {
    try {
      if (!dateString) return 'Não informado';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro na data';
    }
  }

  // Função para formatar valor monetário
  formatCurrency(value) {
    try {
      if (!value || isNaN(value)) return 'R$ 0,00';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    } catch (error) {
      console.error('Erro ao formatar valor:', error);
      return 'R$ 0,00';
    }
  }

  // Versão simplificada para teste
  async generateSimplePdf(pedidoId, clienteId = 'unknown') {
    try {
      console.log('=== GERAÇÃO SIMPLIFICADA DE PDF ===');
      
      const doc = new jsPDF();
      
      // Apenas texto simples
      doc.setFontSize(16);
      doc.text('SHOE REPAIR', 20, 30);
      doc.text('Ordem de Servico', 20, 50);
      doc.text(`Pedido ID: ${pedidoId}`, 20, 70);
      doc.text('Documento de Teste', 20, 90);
      
      const buffer = Buffer.from(doc.output('arraybuffer'));
      console.log('PDF simplificado gerado, tamanho:', buffer.length);
      
      // Fazer upload para S3
      let s3Info = null;
      try {
        s3Info = await this.uploadPdfToS3(buffer, pedidoId, clienteId);
        console.log('PDF simplificado salvo no S3:', s3Info.url);
      } catch (s3Error) {
        console.error('Erro ao salvar PDF simplificado no S3 (continuando sem salvar):', s3Error.message);
      }
      
      return {
        buffer: buffer,
        s3: s3Info
      };
    } catch (error) {
      console.error('Erro no PDF simplificado:', error);
      throw error;
    }
  }

  // Função principal para gerar PDF do pedido
  async generatePedidoPdf(pedidoId) {
    try {
      console.log('=== INICIANDO GERAÇÃO DE PDF ===');
      console.log('pedidoId:', pedidoId);
      
      // Buscar dados do pedido
      const pedido = await pedidoService.getPedido(pedidoId);
      console.log('Dados do pedido retornados:', JSON.stringify(pedido, null, 2));
      
      if (!pedido) {
        throw new Error(`Pedido com ID ${pedidoId} não encontrado`);
      }

      // Buscar dados do cliente
      const cliente = await clienteService.getCliente(pedido.clienteId);
      console.log('Dados do cliente retornados:', JSON.stringify(cliente, null, 2));
      
      if (!cliente) {
        throw new Error(`Cliente com ID ${pedido.clienteId} não encontrado`);
      }

      // Criar documento PDF
      console.log('Criando documento PDF...');
      const doc = new jsPDF();
      console.log('Documento PDF criado com sucesso');
      
      // Testar se conseguimos adicionar pelo menos um texto básico
      try {
        doc.text('Teste básico', 20, 20);
        console.log('Texto básico adicionado com sucesso');
      } catch (textError) {
        console.error('ERRO: Não conseguiu adicionar texto básico:', textError);
        throw new Error('Erro na biblioteca jsPDF: ' + textError.message);
      }
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      console.log('Dimensões da página - Width:', pageWidth, 'Height:', pageHeight);
      
      let yPosition = 20;

      // Configurar fonte padrão
      doc.setFont('helvetica', 'normal');
      console.log('Fonte configurada');

      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 90, 160); // Cor azul
      
      // Verificar se o texto está sendo adicionado
      console.log('Adicionando texto do cabeçalho...');
      try {
        doc.text('SHOE REPAIR', pageWidth / 2, yPosition, { align: 'center' });
        console.log('Texto do cabeçalho adicionado com align center');
      } catch (alignError) {
        console.log('Erro com align center, tentando sem align:', alignError.message);
        // Calcular posição manual para centralizar
        const textWidth = doc.getTextWidth('SHOE REPAIR');
        const centerX = (pageWidth - textWidth) / 2;
        doc.text('SHOE REPAIR', centerX, yPosition);
        console.log('Texto do cabeçalho adicionado sem align');
      }
      
      yPosition += 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      try {
        doc.text('Ordem de Servico', pageWidth / 2, yPosition, { align: 'center' });
      } catch (alignError) {
        const textWidth = doc.getTextWidth('Ordem de Servico');
        const centerX = (pageWidth - textWidth) / 2;
        doc.text('Ordem de Servico', centerX, yPosition);
      }
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
      
      console.log('Formatando informações do pedido...');
      const pedidoInfo = [
        `No do Pedido: ${pedido.id || 'N/A'}`,
        `Data de Criacao: ${this.formatDate(pedido.createdAt || pedido.dataCriacao)}`,
        `Data Prevista: ${this.formatDate(pedido.dataPrevistaEntrega)}`,
        `Status Atual: ${pedido.status || 'Nao informado'}`,
        `Departamento: ${pedido.departamento || 'Nao informado'}`
      ];
      
      console.log('Informações do pedido formatadas:', pedidoInfo);

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

      console.log('Formatando informações do cliente...');
      const clienteInfo = [
        `Nome: ${cliente.nome || 'Nao informado'}`,
        `CPF: ${cliente.cpf || 'Nao informado'}`,
        `Telefone: ${cliente.telefone || 'Nao informado'}`,
        `Email: ${cliente.email || 'Nao informado'}`,
        `Endereço: ${this.formatClienteEndereco(cliente)}`
      ];
      
      console.log('Informações do cliente formatadas:', clienteInfo);

      clienteInfo.forEach(info => {
        doc.text(info, 25, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Detalhes do Serviço
      doc.setFontSize(14);
      doc.setTextColor(44, 90, 160);
      doc.text('Detalhes do Serviço', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Modelo do Tenis: ${pedido.modeloTenis || 'Nao informado'}`, 25, yPosition);
      yPosition += 10;

      // Serviços
      doc.text('Servicos Solicitados:', 25, yPosition);
      yPosition += 8;

      if (pedido.servicos && pedido.servicos.length > 0) {
        pedido.servicos.forEach(servico => {
          doc.text(`• ${servico.nome || 'Servico'} - ${this.formatCurrency(servico.preco)}`, 30, yPosition);
          if (servico.descricao) {
            yPosition += 5;
            doc.setFontSize(9);
            doc.text(`  ${servico.descricao}`, 35, yPosition);
            doc.setFontSize(10);
          }
          yPosition += 6;
        });
      } else {
        doc.text(`• ${pedido.tipoServico || 'Servico não especificado'} - ${this.formatCurrency(pedido.preco)}`, 30, yPosition);
        yPosition += 6;
      }

      yPosition += 5;

      // Total
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const totalText = `Total: ${this.formatCurrency(pedido.precoTotal || pedido.preco)}`;
      try {
        doc.text(totalText, pageWidth - 60, yPosition, { align: 'right' });
      } catch (alignError) {
        const textWidth = doc.getTextWidth(totalText);
        doc.text(totalText, pageWidth - 20 - textWidth, yPosition);
      }
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
        
        const observacoes = pedido.observacoes || pedido.descricaoServicos;
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
          const statusText = `${item.status} - ${this.formatDate(item.date)} ${item.time || ''}`;
          doc.text(statusText, 25, yPosition);
          yPosition += 5;
        });
      }

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Documento gerado em ${this.formatDate(new Date().toISOString())}`, 20, pageHeight - 20);
      
      const footerText = 'Shoe Repair - Sistema de Gerenciamento';
      try {
        doc.text(footerText, pageWidth - 20, pageHeight - 20, { align: 'right' });
      } catch (alignError) {
        const textWidth = doc.getTextWidth(footerText);
        doc.text(footerText, pageWidth - 20 - textWidth, pageHeight - 20);
      }

      // Retornar buffer do PDF
      const pdfArrayBuffer = doc.output('arraybuffer');
      console.log('PDF ArrayBuffer gerado, tamanho:', pdfArrayBuffer.byteLength, 'bytes');
      
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      console.log('Buffer convertido, tamanho:', pdfBuffer.length, 'bytes');
      
      // Fazer upload para S3
      let s3Info = null;
      try {
        s3Info = await this.uploadPdfToS3(pdfBuffer, pedido.id, pedido.clienteId);
        console.log('PDF salvo no S3:', s3Info.url);
      } catch (s3Error) {
        console.error('Erro ao salvar PDF no S3 (continuando sem salvar):', s3Error.message);
      }
      
      console.log('=== PDF GERADO COM SUCESSO ===');
      
      return {
        buffer: pdfBuffer,
        s3: s3Info
      };

    } catch (error) {
      console.error('Erro ao gerar PDF do pedido:', error);
      throw error;
    }
  }

  // Função auxiliar para formatar endereço do cliente
  formatClienteEndereco(cliente) {
    try {
      const enderecoParts = [];
      
      if (cliente && cliente.logradouro) enderecoParts.push(cliente.logradouro);
      if (cliente && cliente.numero) enderecoParts.push(`nº ${cliente.numero}`);
      if (cliente && cliente.bairro) enderecoParts.push(cliente.bairro);
      if (cliente && cliente.cidade) enderecoParts.push(cliente.cidade);
      if (cliente && cliente.estado) enderecoParts.push(cliente.estado);
      if (cliente && cliente.cep) enderecoParts.push(`CEP: ${cliente.cep}`);
      
      return enderecoParts.length > 0 ? enderecoParts.join(', ') : 'Não informado';
    } catch (error) {
      console.error('Erro ao formatar endereço do cliente:', error);
      return 'Erro ao formatar endereço';
    }
  }
}

module.exports = new PdfService();