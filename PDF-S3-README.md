# Funcionalidade de PDF com S3

## Resumo das Alterações

A funcionalidade de geração de PDF foi aprimorada para **automaticamente salvar uma cópia no S3** além de retornar o blob para download.

## Funcionalidades Implementadas

### 1. **Geração e Upload Automático para S3**
- Quando um PDF é gerado, uma cópia é automaticamente salva no S3
- O PDF é organizado na estrutura: `User/{clienteId}/pedidos/{pedidoId}/pdf/pedido-{pedidoId}-{timestamp}.pdf`
- Se o upload para S3 falhar, o sistema continua funcionando normalmente (retornando apenas o blob)

### 2. **Nova Rota para Listar PDFs Salvos**
- **GET** `/pedidos/:id/pdfs` - Lista todos os PDFs salvos no S3 para um pedido específico
- Retorna informações como URL, tamanho, data de criação, etc.

### 3. **Headers de Resposta Melhorados**
- `X-S3-URL`: URL do arquivo salvo no S3 (quando disponível)
- `X-S3-Key`: Chave do arquivo no S3 (quando disponível)

## Configuração Necessária

### Variável de Ambiente
Adicione ao seu arquivo `.env`:
```
S3_BUCKET_NAME=seu-bucket-name
```

### Permissões IAM
Certifique-se de que sua função Lambda tenha as permissões:
- `s3:PutObject` - Para salvar PDFs
- `s3:GetObject` - Para acessar PDFs
- `s3:ListObjects` - Para listar PDFs de um pedido

## Exemplo de Uso

### 1. Gerar PDF (mantém compatibilidade total)
```javascript
POST /pedidos/document/pdf
{
  "pedidoId": "123"
}
```

**Resposta:**
- PDF como blob para download
- Headers com informações do S3 (se salvo com sucesso)

### 2. Listar PDFs salvos de um pedido
```javascript
GET /pedidos/123/pdfs
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "pedidoId": "123",
    "clienteId": "456",
    "pdfs": [
      {
        "key": "User/456/pedidos/123/pdf/pedido-123-2025-09-22T10-30-00-000Z.pdf",
        "lastModified": "2025-09-22T10:30:00.000Z",
        "size": 45678,
        "url": "https://bucket.s3.amazonaws.com/User/456/pedidos/123/pdf/pedido-123-2025-09-22T10-30-00-000Z.pdf",
        "filename": "pedido-123-2025-09-22T10-30-00-000Z.pdf"
      }
    ]
  }
}
```

## Estrutura de Arquivos no S3

```
bucket/
├── User/
│   └── {clienteId}/
│       └── pedidos/
│           └── {pedidoId}/
│               ├── pdf/
│               │   ├── pedido-{pedidoId}-{timestamp1}.pdf
│               │   ├── pedido-{pedidoId}-{timestamp2}.pdf
│               │   └── ...
│               └── imagem1.jpg (fotos existentes)
```

## Vantagens

1. **Histórico Completo**: Todos os PDFs gerados ficam salvos no S3
2. **Compatibilidade**: API mantém 100% de compatibilidade com implementação anterior
3. **Resiliência**: Se S3 falhar, o sistema continua funcionando
4. **Organização**: PDFs organizados por cliente e pedido
5. **Acesso Direto**: URLs diretas para acesso aos PDFs via S3

## Notas Técnicas

- Os PDFs são salvos com Content-Type `application/pdf`
- Timestamps no formato ISO para evitar conflitos de nome
- Logs detalhados para debug
- Fallback para PDF simplificado em caso de erro na geração completa