# Shoe Repair API

API serverless para cadastro de clientes, pedidos e integração com DynamoDB, pronta para deploy na AWS Lambda via CloudFormation.

## Funcionalidades
- CRUD de Clientes
- CRUD de Pedidos
- Persistência em DynamoDB
- Deploy automatizado via GitHub Actions e CloudFormation

## Estrutura de Pastas
```
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── services
│   └── utils
├── handler.js
├── package.json
├── template.yaml
└── .github/workflows/deploy-cfn.yml
```

## Deploy automático (CI/CD)
O deploy é feito automaticamente via GitHub Actions ao dar push na branch `main`.

### Pré-requisitos
- Bucket S3 criado (ex: `shoe-repair-api-artifacts`)
- Secrets configuradas no GitHub:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET_NAME` (nome do bucket S3)

### Como funciona
1. O código é empacotado e enviado para o S3.
2. O CloudFormation faz o deploy do Lambda, API Gateway e DynamoDB.

## Executando localmente
1. Instale as dependências:
   ```sh
   npm install
   ```
2. (Opcional) Crie um arquivo `local.js` para rodar o Express localmente:
   ```js
   require('dotenv').config();
   const app = require('./handler').app || require('./handler').default || require('./handler');
   const port = process.env.PORT || 3000;
   app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
   ```
3. Adicione ao `package.json`:
   ```json
   "scripts": {
     "start:local": "node local.js"
   }
   ```
4. Rode:
   ```sh
   npm run start:local
   ```

## Estrutura das tabelas
### Clientes
- id (string, UUID)
- nome, cpf, telefone, email, cep, logradouro, numero, bairro, cidade, estado, complemento (opcional), observacoes (opcional)

### Pedidos
- id (string, UUID)
- clienteId, modeloTenis, tipoServico (enum), descricaoServicos, fotos (array de URLs S3), preco, dataPrevistaEntrega, status (enum)

## Observações
- O template CloudFormation já cria a tabela DynamoDB e o API Gateway integrado ao Lambda.
- O output do stack mostrará a URL da API após o deploy.

---

> Dúvidas ou sugestões? Abra uma issue ou pull request!
