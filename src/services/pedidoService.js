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
  const novoPedido = { ...pedido, id: uuidv4() };
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
