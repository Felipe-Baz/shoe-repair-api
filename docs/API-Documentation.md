# 📖 Documentação da API - Shoe Repair Backend

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Autenticação](#autenticação)
- [Rotas da API](#rotas-da-api)
  - [Autenticação](#autenticação-1)
  - [Pedidos](#pedidos)
  - [Clientes](#clientes)
  - [Upload de Arquivos](#upload-de-arquivos)
  - [Status](#status)
  - [Dashboard](#dashboard)
- [Estrutura de Dados](#estrutura-de-dados)
- [Códigos de Erro](#códigos-de-erro)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

API REST para sistema de gestão de reparos de calçados, desenvolvida em Node.js com Express e AWS DynamoDB.

### Características Principais:
- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Sistema de permissões** por role (admin, atendimento, lavagem, pintura)
- ✅ **Upload de imagens** para S3
- ✅ **Geração de PDFs** automática
- ✅ **Histórico de status** completo
- ✅ **Notificações WhatsApp** integradas
- ✅ **Dashboard** com métricas

### Stack Tecnológica:
- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: AWS DynamoDB
- **Armazenamento**: AWS S3
- **Autenticação**: JWT (jsonwebtoken)
- **Deploy**: AWS Lambda (Serverless)

---

## 🚀 Instalação

### Pré-requisitos:
- Node.js 16+
- Conta AWS configurada
- Tabelas DynamoDB criadas

### Configuração:

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/Felipe-Baz/shoe-repair-api
   cd shoe-repair-api
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   # .env
   AWS_REGION=us-east-1
   DYNAMODB_PEDIDO_TABLE=shoeRepairPedidos
   DYNAMODB_CLIENTE_TABLE=shoeRepairClientes
   DYNAMODB_USER_TABLE=shoeRepairUsers
   S3_BUCKET_NAME=shoe-repair-bucket
   JWT_SECRET=your-super-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   WHATSAPP_API_TOKEN=your-whatsapp-token
   ```

4. **Execute localmente**:
   ```bash
   npm start
   ```

---

## 🔐 Autenticação

### Sistema de Autenticação:
- **Tipo**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Expiração**: 1h (Access Token) / 7 dias (Refresh Token)

### Roles disponíveis:
| Role | Permissões |
|------|------------|
| `admin` | Acesso total ao sistema |
| `atendimento` | Gerenciar pedidos e clientes |
| `lavagem` | Ver/atualizar pedidos de lavagem |
| `pintura` | Ver/atualizar pedidos de pintura |

---

## 🛣️ Rotas da API

### Base URL:
```
https://api.shoerepair.com/dev
```

---

## 🔑 Autenticação

### `POST /auth/register`
Registrar novo usuário no sistema.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "role": "atendimento",
  "name": "Nome do Usuário"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": "user-123",
    "email": "usuario@exemplo.com",
    "role": "atendimento",
    "name": "Nome do Usuário"
  }
}
```

### `POST /auth/login`
Fazer login no sistema.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "usuario@exemplo.com",
    "role": "atendimento",
    "name": "Nome do Usuário"
  }
}
```

### `POST /auth/refresh-token`
Renovar token de acesso.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👟 Pedidos

### `GET /pedidos`
Listar todos os pedidos (formato básico).

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
[
  {
    "id": "10032024AB1C",
    "clienteId": "cliente-123",
    "clientName": "João Silva",
    "modeloTenis": "Nike Air Max",
    "status": "Atendimento - Aguardando Aprovação",
    "precoTotal": 150.50,
    "dataCriacao": "2024-10-03T10:30:00.000Z"
  }
]
```

### `GET /pedidos/kanban/status`
Listar pedidos formatados para kanban (com filtros por role).

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "10032024AB1C",
      "clientName": "João Silva Santos",
      "clientCpf": "123.456.789-10",
      "sneaker": "Nike Air Max 270",
      "serviceType": "Lavagem e Pintura",
      "description": "Lavagem completa, Pintura personalizada",
      "price": 180.50,
      "servicos": "Lavagem completa, Pintura personalizada, Troca de cadarço",
      "status": "Lavagem - Em Andamento",
      "createdDate": "2024-10-01",
      "expectedDate": "2024-10-08",
      "statusHistory": [...],
      "precoTotal": 180.50,
      "valorSinal": 50.00,
      "valorRestante": 130.50,
      "garantia": {
        "ativa": true,
        "preco": 25.00,
        "duracao": "6 meses",
        "data": "2024-10-08"
      },
      "acessorios": ["Cadarço Nike original", "Spray impermeabilizante"],
      "fotos": ["https://s3.amazonaws.com/foto1.jpg"],
      "observacoes": "Cliente solicitou cores específicas"
    }
  ]
}
```

### `GET /pedidos/:id`
Obter pedido específico por ID.

**Response (200):**
```json
{
  "id": "10032024AB1C",
  "clienteId": "cliente-123",
  "clientName": "João Silva",
  "modeloTenis": "Nike Air Max 270",
  "servicos": [
    {
      "id": "servico-1",
      "nome": "Lavagem completa",
      "preco": 45.00,
      "descricao": "Lavagem com produtos especiais"
    }
  ],
  "fotos": ["https://s3.amazonaws.com/foto1.jpg"],
  "precoTotal": 180.50,
  "valorSinal": 50.00,
  "valorRestante": 130.50,
  "dataPrevistaEntrega": "2024-10-08",
  "departamento": "Lavagem",
  "observacoes": "Cliente solicitou cores específicas",
  "garantia": {
    "ativa": true,
    "preco": 25.00,
    "duracao": "6 meses",
    "data": "2024-10-08"
  },
  "acessorios": ["Cadarço Nike original"],
  "status": "Lavagem - Em Andamento",
  "statusHistory": [...],
  "dataCriacao": "2024-10-03T10:30:00.000Z"
}
```

### `POST /pedidos`
Criar novo pedido.

**Body:**
```json
{
  "clienteId": "cliente-123",
  "clientName": "João Silva",
  "modeloTenis": "Nike Air Max 270",
  "servicos": [
    {
      "id": "servico-1",
      "nome": "Lavagem completa",
      "preco": 45.00,
      "descricao": "Lavagem com produtos especiais"
    },
    {
      "id": "servico-2", 
      "nome": "Pintura personalizada",
      "preco": 135.50,
      "descricao": "Pintura em cores personalizadas"
    }
  ],
  "fotos": ["https://s3.amazonaws.com/foto1.jpg"],
  "precoTotal": 180.50,
  "valorSinal": 50.00,
  "valorRestante": 130.50,
  "dataPrevistaEntrega": "2024-10-08",
  "departamento": "Atendimento",
  "observacoes": "Cliente solicitou cores específicas: azul royal e branco",
  "garantia": {
    "ativa": true,
    "preco": 25.00,
    "duracao": "6 meses",
    "data": "2024-10-08"
  },
  "acessorios": ["Cadarço Nike original branco", "Spray impermeabilizante"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "10032024AB1C",
    "clienteId": "cliente-123",
    "clientName": "João Silva",
    // ... todos os campos do pedido
  },
  "message": "Pedido criado com sucesso"
}
```

### `PUT /pedidos/:id`
Atualizar pedido completo.

**Body:** (Mesmo formato do POST)

**Response (200):**
```json
{
  "id": "10032024AB1C",
  // ... pedido atualizado
}
```

### `PATCH /pedidos/:id`
Atualização parcial de pedido (com validação de permissões).

**Body:**
```json
{
  "status": "Lavagem - Concluído",
  "observacoes": "Lavagem finalizada com sucesso"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "10032024AB1C",
    // ... pedido atualizado
  },
  "message": "Pedido atualizado com sucesso. Campos alterados: status, observacoes"
}
```

### `DELETE /pedidos/:id`
Excluir pedido.

**Response (200):**
```json
{
  "deleted": true
}
```

### `PATCH /pedidos/:id/status`
Atualizar apenas status do pedido (com histórico automático).

**Body:**
```json
{
  "status": "Lavagem - Concluído"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "10032024AB1C",
    "status": "Lavagem - Concluído",
    "statusHistory": [...],
    "updatedAt": "2024-10-03T15:30:00.000Z"
  },
  "message": "Status atualizado com sucesso"
}
```

### `POST /pedidos/document/pdf`
Gerar PDF do pedido.

**Body:**
```json
{
  "pedidoId": "10032024AB1C"
}
```

**Response (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="pedido-10032024AB1C.pdf"

[Binary PDF Data]
```

### `GET /pedidos/:id/pdfs`
Listar PDFs salvos do pedido.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pedidoId": "10032024AB1C",
    "clienteId": "cliente-123",
    "pdfs": [
      {
        "key": "User/cliente-123/pedidos/10032024AB1C/pdf/pedido.pdf",
        "lastModified": "2024-10-03T15:30:00.000Z",
        "size": 245760,
        "url": "https://bucket.s3.amazonaws.com/User/cliente-123/pedidos/10032024AB1C/pdf/pedido.pdf",
        "filename": "pedido.pdf"
      }
    ]
  }
}
```

---

## 👥 Clientes

### `GET /clientes`
Listar todos os clientes.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
[
  {
    "id": "cliente-123",
    "nome": "João Silva Santos",
    "cpf": "123.456.789-10", 
    "telefone": "+5511999888777",
    "email": "joao@exemplo.com",
    "endereco": {
      "rua": "Rua das Flores, 123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "cep": "01234-567",
      "uf": "SP"
    },
    "dataCriacao": "2024-10-01T10:00:00.000Z"
  }
]
```

### `GET /clientes/:id`
Obter cliente específico.

### `POST /clientes`
Criar novo cliente.

**Body:**
```json
{
  "nome": "João Silva Santos",
  "cpf": "123.456.789-10",
  "telefone": "+5511999888777", 
  "email": "joao@exemplo.com",
  "endereco": {
    "rua": "Rua das Flores, 123",
    "bairro": "Centro",
    "cidade": "São Paulo", 
    "cep": "01234-567",
    "uf": "SP"
  }
}
```

### `PUT /clientes/:id`
Atualizar cliente.

### `DELETE /clientes/:id`
Excluir cliente.

---

## 📤 Upload de Arquivos

### `POST /upload/fotos`
Upload de fotos (máximo 5 arquivos, 5MB cada).

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

**Body (Form Data):**
```
fotos: [File1, File2, File3] // Array de arquivos
```

**Response (200):**
```json
{
  "success": true,
  "urls": [
    "https://bucket.s3.amazonaws.com/uploads/foto1.jpg",
    "https://bucket.s3.amazonaws.com/uploads/foto2.jpg",
    "https://bucket.s3.amazonaws.com/uploads/foto3.jpg"
  ]
}
```

---

## 📊 Status

### `GET /status/columns`
Obter colunas de status baseadas no role do usuário.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**

**Para role "admin":**
```json
{
  "success": true,
  "data": {
    "Atendimento - Recebido": [],
    "Atendimento - Orçado": [],
    "Atendimento - Aprovado": [],
    "Lavagem - A Fazer": [],
    "Lavagem - Em Andamento": [],
    "Lavagem - Concluído": [],
    "Pintura - A Fazer": [],
    "Pintura - Em Andamento": [],
    "Pintura - Concluído": [],
    "Atendimento - Finalizado": [],
    "Atendimento - Entregue": []
  }
}
```

**Para role "lavagem":**
```json
{
  "success": true,
  "data": {
    "Lavagem - A Fazer": [],
    "Lavagem - Em Andamento": [],
    "Lavagem - Concluído": []
  }
}
```

---

## 📈 Dashboard

### `GET /dashboard`
Obter dados do dashboard com métricas.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumo": {
      "totalPedidos": 156,
      "pedidosHoje": 8,
      "receita": 15420.50,
      "receitaHoje": 450.00
    },
    "statusDistribution": {
      "Atendimento - Aguardando Aprovação": 12,
      "Lavagem - Em Andamento": 25,
      "Pintura - A Fazer": 18,
      "Atendimento - Finalizado": 89
    },
    "receitaPorMes": [
      { "mes": "Jan", "valor": 12500.00 },
      { "mes": "Fev", "valor": 13200.00 },
      { "mes": "Mar", "valor": 15420.50 }
    ],
    "topServicos": [
      { "nome": "Lavagem completa", "quantidade": 45, "receita": 2025.00 },
      { "nome": "Pintura personalizada", "quantidade": 28, "receita": 3780.00 }
    ]
  }
}
```

---

## 🗄️ Estrutura de Dados

### Pedido
```typescript
interface Pedido {
  id: string;                    // ID único (formato: MMDDYYYYXXXX)
  clienteId: string;             // ID do cliente
  clientName: string;            // Nome do cliente
  modeloTenis: string;           // Modelo do tênis
  servicos: Array<{              // Serviços contratados
    id: string;
    nome: string;
    preco: number;
    descricao: string;
  }>;
  fotos: string[];               // URLs das fotos no S3
  precoTotal: number;            // Valor total
  valorSinal: number;            // Valor do sinal pago
  valorRestante: number;         // Valor restante
  dataPrevistaEntrega: string;   // Data prevista (ISO)
  departamento: string;          // Departamento atual
  observacoes: string;           // Observações gerais
  garantia: {                    // Informações da garantia
    ativa: boolean;
    preco: number;
    duracao: string;
    data: string;
  };
  acessorios: string[];          // Acessórios inclusos
  status: string;                // Status atual
  statusHistory: Array<{         // Histórico de status
    status: string;
    date: string;
    time: string;
    userId: string;
    userName: string;
    timestamp: string;
  }>;
  dataCriacao: string;           // Data de criação (ISO)
  createdAt: string;             // Timestamp de criação
  updatedAt: string;             // Último update
}
```

### Cliente
```typescript
interface Cliente {
  id: string;                    // ID único
  nome: string;                  // Nome completo
  cpf: string;                   // CPF
  telefone: string;              // Telefone (+5511999888777)
  email: string;                 // Email
  endereco: {                    // Endereço completo
    rua: string;
    bairro: string;
    cidade: string;
    cep: string;
    uf: string;
  };
  dataCriacao: string;           // Data de criação (ISO)
}
```

### Usuário
```typescript
interface User {
  id: string;                    // ID único
  email: string;                 // Email (login)
  password: string;              // Senha hasheada
  role: 'admin' | 'atendimento' | 'lavagem' | 'pintura';
  name: string;                  // Nome completo
  createdAt: string;             // Data de criação
  updatedAt: string;             // Último update
}
```

---

## ⚠️ Códigos de Erro

### Autenticação (401):
```json
{
  "success": false,
  "error": "Token inválido ou expirado"
}
```

### Autorização (403):
```json
{
  "success": false,
  "error": "Usuário não tem permissão para alterar para este status"
}
```

### Não Encontrado (404):
```json
{
  "success": false,
  "error": "Pedido não encontrado"
}
```

### Validação (400):
```json
{
  "success": false,
  "error": "Campos obrigatórios: clienteId, clientName, modeloTenis e servicos"
}
```

### Servidor (500):
```json
{
  "success": false,
  "error": "Erro interno do servidor"
}
```

---

## 📝 Exemplos de Uso

### Fluxo Completo de Pedido:

1. **Login:**
   ```bash
   curl -X POST https://api.shoerepair.com/dev/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@loja.com","password":"123456"}'
   ```

2. **Criar Cliente:**
   ```bash
   curl -X POST https://api.shoerepair.com/dev/clientes \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"nome":"João Silva","cpf":"123.456.789-10",...}'
   ```

3. **Upload de Fotos:**
   ```bash
   curl -X POST https://api.shoerepair.com/dev/upload/fotos \
     -H "Authorization: Bearer <token>" \
     -F "fotos=@foto1.jpg" \
     -F "fotos=@foto2.jpg"
   ```

4. **Criar Pedido:**
   ```bash
   curl -X POST https://api.shoerepair.com/dev/pedidos \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"clienteId":"cliente-123","clientName":"João Silva",...}'
   ```

5. **Atualizar Status:**
   ```bash
   curl -X PATCH https://api.shoerepair.com/dev/pedidos/10032024AB1C/status \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"status":"Lavagem - Concluído"}'
   ```

6. **Gerar PDF:**
   ```bash
   curl -X POST https://api.shoerepair.com/dev/pedidos/document/pdf \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"pedidoId":"10032024AB1C"}' \
     --output pedido.pdf
   ```

---

## 🔧 Configurações Avançadas

### Variáveis de Ambiente Opcionais:
```bash
# WhatsApp Integration
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_PHONE_NUMBER=+5511999888777

# PDF Generation
PDF_LOGO_URL=https://s3.amazonaws.com/logo.png
PDF_COMPANY_NAME="Shoe Repair LTDA"

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Timeouts
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB
MAX_FILES_PER_UPLOAD=5
```

### Estrutura de Permissões por Endpoint:

| Endpoint | admin | atendimento | lavagem | pintura |
|----------|-------|-------------|---------|---------|
| `GET /pedidos/*` | ✅ | ✅ | 🔍* | 🔍* |
| `POST /pedidos` | ✅ | ✅ | ❌ | ❌ |
| `PATCH /pedidos/*/status` | ✅ | ✅ | 🔍** | 🔍** |
| `GET /clientes/*` | ✅ | ✅ | ❌ | ❌ |
| `POST /upload/*` | ✅ | ✅ | ✅ | ✅ |
| `GET /dashboard` | ✅ | ✅ | ✅ | ✅ |

*🔍 Filtrado por status relevante ao departamento  
**🔍 Apenas status do próprio departamento

---

**Versão da API**: 1.0.0  
**Última Atualização**: Outubro 2024  
**Contato**: Felipe Baz - felipe@exemplo.com