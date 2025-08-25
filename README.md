# Shoe Repair API

API serverless para cadastro de clientes, pedidos, upload de fotos, autenticação JWT e integração com DynamoDB, pronta para deploy na AWS Lambda via CloudFormation.

## Funcionalidades
- CRUD de Clientes
- CRUD de Pedidos
- Upload de fotos para S3 (com organização por usuário/pedido)
- Autenticação JWT (login, cadastro, refresh token)
- Persistência em DynamoDB
- Deploy automatizado via GitHub Actions e CloudFormation

## Estrutura de Pastas
```
├── src
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   └── utils
├── handler.js
├── package.json
├── template.yaml
└── .github/workflows/deploy-cfn.yml
```

## Como subir o projeto (Deploy na AWS)

### 1. Pré-requisitos
- Conta AWS com permissões para Lambda, S3, DynamoDB, CloudFormation e SSM Parameter Store
- [Node.js 18+](https://nodejs.org/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### 2. Configurar as secrets no GitHub
No repositório, vá em Settings > Secrets and variables > Actions e adicione:
- `AWS_ACCESS_KEY_ID` — sua chave de acesso AWS
- `AWS_SECRET_ACCESS_KEY` — seu secret AWS
- `S3_BUCKET_NAME` — bucket S3 para upload do código Lambda (ex: `shoe-repair-api-artifacts`)

### 3. Deploy automático (CI/CD)
Basta dar push na branch `main`. O GitHub Actions irá:
1. Empacotar o código e dependências
2. Enviar o ZIP para o bucket S3
3. Executar o deploy do CloudFormation (`template.yaml`)
4. O output mostrará a URL da API

### 4. Deploy manual (opcional)
Você pode rodar localmente:
```sh
npm install
# Empacote o código conforme o workflow ou rode localmente:
node handler.js
```
A API ficará disponível em `http://localhost:3000`.

## Variáveis de ambiente importantes
As principais variáveis já são criadas automaticamente pelo CloudFormation e injetadas no Lambda:
- `DYNAMODB_CLIENTE_TABLE`
- `DYNAMODB_PEDIDO_TABLE`
- `DYNAMODB_USER_TABLE`
- `S3_BUCKET_NAME`
- `JWT_SECRET`
- `REFRESH_SECRET`
- `JWT_EXPIRES`
- `REFRESH_EXPIRES`

## Autenticação JWT
Todas as rotas de clientes, pedidos e upload exigem Bearer Token JWT:
```
Authorization: Bearer <seu_token_jwt>
```
Obtenha o token via `/auth/login`.

## Exemplos de uso (curl)

### Cadastro de usuário
```sh
curl -X POST http://localhost:3000/auth/register \
   -H "Content-Type: application/json" \
   -d '{"email":"usuario@email.com","password":"senhaSegura123","nome":"Usuário Teste"}'
```

### Login
```sh
curl -X POST http://localhost:3000/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"usuario@email.com","password":"senhaSegura123"}'
```

### Refresh token
```sh
curl -X POST http://localhost:3000/auth/refresh-token \
   -H "Content-Type: application/json" \
   -d '{"refreshToken":"<REFRESH_TOKEN_RECEBIDO_NO_LOGIN>"}'
```

### Listar clientes (autenticado)
```sh
curl -X GET http://localhost:3000/clientes \
   -H "Authorization: Bearer <token>"
```

### Criar pedido (autenticado)
```sh
curl -X POST http://localhost:3000/pedidos \
   -H "Authorization: Bearer <token>" \
   -H "Content-Type: application/json" \
   -d '{"clienteId":"...","modeloTenis":"Nike Air Max", ... }'
```

### Upload de fotos (autenticado)
```sh
curl -X POST http://localhost:3000/upload/fotos \
   -H "Authorization: Bearer <token>" \
   -F "userId=123" \
   -F "pedidoId=456" \
   -F "fotos=@/caminho/para/foto1.jpg" \
   -F "fotos=@/caminho/para/foto2.jpg"
```

## Estrutura das tabelas
### Clientes
- id (string, UUID)
- nome, cpf, telefone, email, cep, logradouro, numero, bairro, cidade, estado, complemento (opcional), observacoes (opcional)

### Pedidos
- id (string, UUID)
- clienteId, modeloTenis, tipoServico (enum), descricaoServicos, fotos (array de URLs S3), preco, dataPrevistaEntrega, status (enum)

### Usuários
- id (string, UUID)
- email (string, único)
- password (string, hash ou texto)
- nome (string)

## Observações
- O template CloudFormation já cria todas as tabelas DynamoDB, bucket S3 e API Gateway integrado ao Lambda.
- O output do stack mostrará a URL da API após o deploy.
- As secrets JWT podem ser alteradas no Parameter Store da AWS para maior segurança.

---

> Dúvidas ou sugestões? Abra uma issue ou pull request!
