# String Sanitizer - Documentação

## Visão Geral

O `StringSanitizer` é um utilitário criado para remover caracteres especiais, de controle e não imprimíveis das strings retornadas das consultas ao banco de dados. Isso é especialmente importante para evitar problemas na geração de PDFs e outros documentos.

## Problema Resolvido

Dados vindos do banco podem conter:
- Caracteres de controle (`\x00`, `\x1F`, `\x7F`, etc.)
- Caracteres não imprimíveis
- Emojis e símbolos especiais
- Quebras de linha desnecessárias
- Acentos que podem causar problemas em PDFs

## Métodos Disponíveis

### `StringSanitizer.sanitizeString(str)`
Remove caracteres especiais de uma string individual.

```javascript
const resultado = StringSanitizer.sanitizeString('João™\x00Silva');
// Resultado: "JoaoSilva"
```

### `StringSanitizer.sanitizeObject(obj)`
Sanitiza recursivamente todas as strings em um objeto ou array.

```javascript
const pedido = {
  nome: 'Serviço™\x00Especial',
  servicos: [
    { nome: 'Limpeza\x1FProfunda', preco: 100 }
  ]
};

const sanitizado = StringSanitizer.sanitizeObject(pedido);
// Todas as strings são sanitizadas automaticamente
```

### `StringSanitizer.sanitizeFields(obj, fields)`
Sanitiza apenas campos específicos de um objeto.

```javascript
const cliente = {
  nome: 'João\x00Silva',
  email: 'joao@email.com',
  telefone: '(11)\x1F99999-9999'
};

const resultado = StringSanitizer.sanitizeFields(cliente, ['nome', 'telefone']);
// Apenas nome e telefone são sanitizados
```

### `StringSanitizer.removeControlChars(str)`
Remove apenas caracteres de controle, preservando acentos.

```javascript
const resultado = StringSanitizer.removeControlChars('João\x00™Silva');
// Resultado: "João™Silva" (preserva acentos e símbolos)
```

### `StringSanitizer.sanitizeFileName(str)`
Sanitiza string para uso seguro em nomes de arquivo.

```javascript
const nome = StringSanitizer.sanitizeFileName('pedido-123: cliente/João™.pdf');
// Resultado: "pedido-123_clienteJoao™.pdf"
```

## Uso no Projeto

### No pdfService.js

O `StringSanitizer` é usado automaticamente no `pdfService` para:

1. **Sanitizar dados completos do pedido e cliente:**
```javascript
const pedido = StringSanitizer.sanitizeObject(pedidoRaw);
const cliente = StringSanitizer.sanitizeObject(clienteRaw);
```

2. **Sanitização específica de campos críticos:**
```javascript
// Para serviços
const nomeServico = StringSanitizer.sanitizeString(servico.nome || 'Servico');
const descricaoServico = StringSanitizer.sanitizeString(servico.descricao);

// Para observações
const observacoes = StringSanitizer.sanitizeString(pedido.observacoes);
```

### Uso em Outros Serviços

O `StringSanitizer` pode ser usado em qualquer parte do sistema:

```javascript
const StringSanitizer = require('../utils/stringSanitizer');

// Em controladores
exports.createPedido = async (req, res) => {
  const dadosSanitizados = StringSanitizer.sanitizeObject(req.body);
  // usar dadosSanitizados...
};

// Em serviços
const dadosLimpos = StringSanitizer.sanitizeFields(dados, ['nome', 'descricao']);
```

## Caracteres Removidos/Transformados

### Caracteres de Controle
- `\x00-\x1F` (NULL, controles ASCII)
- `\x7F-\x9F` (DEL, controles estendidos)

### Normalização de Acentos
- `á, à, ã, â` → `a`
- `é, è, ê` → `e`
- `í, ì, î` → `i`
- `ó, ò, õ, ô` → `o`
- `ú, ù, û` → `u`
- `ç` → `c`

### Caracteres Mantidos
- Letras (a-z, A-Z)
- Números (0-9)
- Espaços
- Pontuação básica: `- . , ! ? ( ) / @ # $ % & * + = : ;`

## Benefícios

1. **PDFs Limpos**: Evita problemas na renderização de PDFs
2. **Consistência**: Dados uniformes em todo o sistema
3. **Segurança**: Remove caracteres potencialmente problemáticos
4. **Flexibilidade**: Diferentes níveis de sanitização conforme necessário
5. **Performance**: Processamento eficiente e reutilizável

## Localização

```
src/utils/stringSanitizer.js
```

## Exemplo Completo

```javascript
const StringSanitizer = require('../utils/stringSanitizer');

// Dados vindos do banco com problemas
const dadosBrutos = {
  cliente: 'João™\x00Silva',
  servicos: [
    {
      nome: 'Limpeza\x1FProfunda®',
      descricao: 'Serviço\n\nprofissional\tcom\rvários caracteres'
    }
  ],
  observacoes: 'Observação\x7Fespecial™'
};

// Sanitização completa
const dadosLimpos = StringSanitizer.sanitizeObject(dadosBrutos);

console.log(dadosLimpos);
// {
//   cliente: 'JoaoSilva',
//   servicos: [
//     {
//       nome: 'LimpezaProfunda',
//       descricao: 'Servicoprofissionalcomvarioscaracteres'
//     }
//   ],
//   observacoes: 'Observacaoespecial'
// }
```

O `StringSanitizer` garante que todos os dados usados na geração de PDFs e outras operações sejam limpos e seguros.