const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const tableName = process.env.DYNAMODB_PEDIDO_TABLE || 'shoeRepairPedidos';

const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION });

exports.listPedidos = async () => {
  const params = { TableName: tableName };
  const data = await dynamoDb.scan(params).promise();
  return data.Items;
};

exports.getPedido = async (id) => {
  const params = { TableName: tableName, Key: { id } };
  const data = await dynamoDb.get(params).promise();
  return data.Item;
};

exports.createPedido = async (pedido) => {
  // Estruturar o pedido com todos os campos necessários
  const novoPedido = { 
    id: uuidv4(),
    clienteId: pedido.clienteId,
    clientName: pedido.clientName,
    modeloTenis: pedido.modeloTenis,
    servicos: pedido.servicos || [],
    fotos: pedido.fotos || [],
    precoTotal: pedido.precoTotal,
    valorSinal: pedido.valorSinal || 0,
    valorRestante: pedido.valorRestante || 0,
    dataPrevistaEntrega: pedido.dataPrevistaEntrega,
    departamento: pedido.departamento || 'Atendimento',
    observacoes: pedido.observacoes || '',
    garantia: pedido.garantia || {
      ativa: false,
      preco: 0,
      duracao: '',
      data: ''
    },
    acessorios: pedido.acessorios || [],
    status: pedido.status || 'Atendimento - Aguardando Aprovação',
    dataCriacao: pedido.dataCriacao || new Date().toISOString(),
    createdAt: pedido.createdAt || new Date().toISOString(),
    updatedAt: pedido.updatedAt || new Date().toISOString(),
    statusHistory: pedido.statusHistory || [],
    // Manter compatibilidade com campos antigos se existirem
    tipoServico: pedido.tipoServico,
    descricaoServicos: pedido.descricaoServicos,
    preco: pedido.preco
  };

  const params = { TableName: tableName, Item: novoPedido };
  await dynamoDb.put(params).promise();
  return novoPedido;
};

exports.updatePedido = async (id, updates) => {
  let updateExp = 'set ';
  const attrNames = {};
  const attrValues = {};
  let prefix = '';
  for (const key in updates) {
    if (key === 'id') continue;
    updateExp += `${prefix}#${key} = :${key}`;
    attrNames[`#${key}`] = key;
    attrValues[`:${key}`] = updates[key];
    prefix = ', ';
  }
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: updateExp,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: attrValues,
    ReturnValues: 'ALL_NEW',
  };
  const data = await dynamoDb.update(params).promise();
  return data.Attributes;
};

exports.deletePedido = async (id) => {
  const params = { TableName: tableName, Key: { id } };
  await dynamoDb.delete(params).promise();
  return true;
};

exports.updatePedidoStatus = async (id, status) => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set #status = :status, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW',
  };
  const data = await dynamoDb.update(params).promise();
  return data.Attributes;
};
