const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
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

  // Função para processar template HTML
  async processTemplate(templatePath, data) {
    try {
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Substituir variáveis simples
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value || '');
      }
      
      return template;
    } catch (error) {
      console.error('Erro ao processar template:', error);
      throw new Error('Erro ao processar template HTML');
    }
  }

  // Função para gerar HTML dos serviços
  generateServicesRows(servicos, tipoServico, descricaoServicos, preco) {
    let rows = '';
    
    // Usar nova estrutura de serviços se disponível
    if (servicos && servicos.length > 0) {
      servicos.forEach(servico => {
        rows += `
          <tr>
            <td>${servico.nome || 'Serviço não especificado'}</td>
            <td>${servico.descricao || '-'}</td>
            <td>${this.formatCurrency(servico.preco)}</td>
          </tr>
        `;
      });
    } else {
      // Fallback para estrutura antiga
      rows += `
        <tr>
          <td>${tipoServico || 'Serviço não especificado'}</td>
          <td>${descricaoServicos || '-'}</td>
          <td>${this.formatCurrency(preco)}</td>
        </tr>
      `;
    }
    
    return rows;
  }

  // Função para gerar HTML do histórico de status
  generateStatusHistoryItems(statusHistory) {
    if (!statusHistory || statusHistory.length === 0) {
      return '<p>Nenhum histórico de status disponível.</p>';
    }
    
    let items = '';
    statusHistory.forEach(item => {
      const date = this.formatDate(item.date);
      const time = item.time || '';
      const user = item.userName || item.userId || 'Sistema';
      
      items += `
        <div class="status-item">
          <span><strong>${item.status}</strong> - ${user}</span>
          <span>${date} ${time}</span>
        </div>
      `;
    });
    
    return items;
  }

  // Função principal para gerar PDF do pedido
  async generatePedidoPdf(pedidoId) {
    let browser = null;
    
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

      // Preparar dados para o template
      const templateData = {
        pedidoId: pedido.id,
        dataCriacao: this.formatDate(pedido.createdAt || pedido.dataCriacao),
        dataPrevista: this.formatDate(pedido.dataPrevistaEntrega),
        status: pedido.status || 'Não informado',
        departamento: pedido.departamento || 'Não informado',
        
        // Dados do cliente
        clienteNome: cliente.nome || 'Não informado',
        clienteCpf: cliente.cpf || 'Não informado',
        clienteTelefone: cliente.telefone || 'Não informado',
        clienteEmail: cliente.email || 'Não informado',
        clienteEndereco: this.formatClienteEndereco(cliente),
        
        // Dados do serviço
        modeloTenis: pedido.modeloTenis || 'Não informado',
        precoTotal: this.formatCurrency(pedido.precoTotal || pedido.preco),
        observacoes: pedido.observacoes || pedido.descricaoServicos || '',
        
        // Dados dinâmicos
        servicosRows: this.generateServicesRows(
          pedido.servicos, 
          pedido.tipoServico, 
          pedido.descricaoServicos, 
          pedido.preco
        ),
        statusHistoryItems: this.generateStatusHistoryItems(pedido.statusHistory),
        dataGeracao: this.formatDate(new Date().toISOString())
      };

      // Processar template
      const templatePath = path.join(__dirname, '../templates/pedido-pdf.html');
      const htmlContent = await this.processTemplate(templatePath, templateData);

      // Configurar puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();
      
      // Definir conteúdo HTML
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdfBuffer;

    } catch (error) {
      console.error('Erro ao gerar PDF do pedido:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Função auxiliar para formatar endereço do cliente
  formatClienteEndereco(cliente) {
    const enderecoParts = [];
    
    if (cliente.logradouro) enderecoParts.push(cliente.logradouro);
    if (cliente.numero) enderecoParts.push(`nº ${cliente.numero}`);
    if (cliente.bairro) enderecoParts.push(cliente.bairro);
    if (cliente.cidade) enderecoParts.push(cliente.cidade);
    if (cliente.estado) enderecoParts.push(cliente.estado);
    if (cliente.cep) enderecoParts.push(`CEP: ${cliente.cep}`);
    
    return enderecoParts.length > 0 ? enderecoParts.join(', ') : 'Não informado';
  }
}

module.exports = new PdfService();