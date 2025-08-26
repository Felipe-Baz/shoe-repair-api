const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Token do Meta WhatsApp Cloud API
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // ID do número do WhatsApp Business

/**
 * Gera uma mensagem personalizada para o cliente de acordo com o status do pedido.
 * @param {string} nomeCliente
 * @param {string} status
 * @param {string} descricaoServicos
 * @param {string} modeloTenis
 * @returns {string} Mensagem pronta para envio
 */
function gerarMensagemStatusPedido(nomeCliente, status, descricaoServicos, modeloTenis) {
  const statusLower = status.toLowerCase();

  if (statusLower === 'concluido' || statusLower === 'finalizado') {
    return (
      `Olá, ${nomeCliente}! 😊\n\n` +
      `Temos uma ótima notícia: o ajuste de *${descricaoServicos}* no seu *${modeloTenis}* foi finalizado com sucesso!\n\n` +
      `Seu produto já está pronto para retirada. Ficamos felizes em poder ajudar!\n\n` +
      `Se precisar de algo mais, conte sempre conosco.`
    );
  }

  if (statusLower === 'em_andamento' || statusLower === 'em andamento') {
    return (
      `Olá, ${nomeCliente}! 👟\n\n` +
      `Seu pedido de *${descricaoServicos}* para o *${modeloTenis}* está em andamento. Nossa equipe está cuidando de tudo com carinho!\n\n` +
      `Assim que houver novidades, avisaremos por aqui.`
    );
  }

  if (statusLower === 'cancelado' || statusLower === 'cancelada') {
    return (
      `Olá, ${nomeCliente}.\n\n` +
      `Infelizmente, o pedido de *${descricaoServicos}* para o *${modeloTenis}* foi cancelado. Se precisar de mais informações ou quiser reabrir o pedido, estamos à disposição.`
    );
  }

  // Mensagem padrão para outros status
  return (
    `Olá, ${nomeCliente}! 😊\n\n` +
    `Temos novidades sobre o seu pedido de *${descricaoServicos}* para o *${modeloTenis}*.\n` +
    `O status agora é: *${status}*.\n\n` +
    `Se tiver dúvidas ou precisar de mais informações, estamos à disposição!\n\n` +
    `Obrigado por confiar no nosso serviço.`
  );
}

/**
 * Envia mensagem de status do pedido para o cliente via WhatsApp.
 * @param {string} telefoneCliente - Telefone do cliente no formato internacional, ex: 5511999999999
 * @param {string} nomeCliente - Nome do cliente
 * @param {string} status - Novo status do pedido
 * @param {string} descricaoServicos - Descrição dos serviços do pedido
 * @param {string} modeloTenis - Modelo do tênis
 */
async function enviarStatusPedido(telefoneCliente, nomeCliente, status, descricaoServicos, modeloTenis) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('WhatsApp API não configurada.');
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const mensagem = gerarMensagemStatusPedido(nomeCliente, status, descricaoServicos, modeloTenis);

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: telefoneCliente,
        type: "text",
        text: { body: mensagem }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`Mensagem WhatsApp enviada para ${telefoneCliente}`);
  } catch (err) {
    console.error('Erro ao enviar mensagem WhatsApp:', err.response?.data || err.message);
  }
}

module.exports = { enviarStatusPedido, gerarMensagemStatusPedido };