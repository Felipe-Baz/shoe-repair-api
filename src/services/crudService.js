const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const tableName = process.env.DYNAMODB_TABLE;

const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION });

exports.listItems = async () => {
  const params = { TableName: tableName };
  const data = await dynamoDb.scan(params).promise();
  return data.Items;
};

exports.getItem = async (id) => {
  const params = { TableName: tableName, Key: { id } };
  const data = await dynamoDb.get(params).promise();
  return data.Item;
};

exports.createItem = async (item) => {
  const newItem = { ...item, id: uuidv4() };
  const params = { TableName: tableName, Item: newItem };
  await dynamoDb.put(params).promise();
  return newItem;
};

exports.updateItem = async (id, updates) => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: { ':name': updates.name },
    ReturnValues: 'ALL_NEW',
  };
  const data = await dynamoDb.update(params).promise();
  return data.Attributes;
};

exports.deleteItem = async (id) => {
  const params = { TableName: tableName, Key: { id } };
  await dynamoDb.delete(params).promise();
  return true;
};
