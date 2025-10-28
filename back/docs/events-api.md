# Endpoint para Listar Eventos

## GET /api/events

Endpoint para listar todos os eventos de um site específico com filtros de data e paginação.

### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `name` | string | Não | Filtrar por nome do evento (busca parcial) | `page_view` |
| `userId` | string | Não | Filtrar por ID do usuário | `user_123` |
| `sessionId` | string | Não | Filtrar por ID da sessão | `session_456` |
| `dateFilter` | enum | Não | Filtro de data predefinido | `day`, `week`, `month`, `year`, `custom` |
| `startDate` | string | Não | Data de início (ISO 8601) | `2024-01-01T00:00:00Z` |
| `endDate` | string | Não | Data de fim (ISO 8601) | `2024-01-31T23:59:59Z` |
| `limit` | number | Não | Limite de eventos por página (1-1000) | `50` (padrão: 100) |
| `offset` | number | Não | Offset para paginação | `0` (padrão: 0) |
| `orderBy` | string | Não | Campo para ordenação | `ts`, `name`, `createdAt` (padrão: `ts`) |
| `order` | string | Não | Direção da ordenação | `asc`, `desc` (padrão: `desc`) |

### Headers Obrigatórios

- `X-Site-Key`: Chave do site (ou parâmetro `site` na query)

### Exemplos de Uso

#### 1. Listar eventos do dia atual
```bash
GET /api/events?dateFilter=day
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

#### 2. Listar eventos da última semana com paginação
```bash
GET /api/events?dateFilter=week&limit=50&offset=0
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

#### 3. Filtrar por nome de evento específico
```bash
GET /api/events?name=page_view&dateFilter=month
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

#### 4. Período customizado
```bash
GET /api/events?dateFilter=custom&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

#### 5. Filtrar por usuário específico
```bash
GET /api/events?userId=user_123&dateFilter=day
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

### Resposta

```json
{
  "events": [
    {
      "id": "123456789",
      "name": "page_view",
      "userId": "user_123",
      "sessionId": "session_456",
      "properties": {
        "url": "/products",
        "title": "Products Page"
      },
      "context": {
        "userAgent": "Mozilla/5.0...",
        "ip": "192.168.1.0",
        "serverTs": "2024-01-15T10:30:00Z"
      },
      "ts": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### Filtros de Data

- **`day`**: Eventos do dia atual (00:00:00 até 23:59:59)
- **`week`**: Eventos da semana atual (domingo até sábado)
- **`month`**: Eventos do mês atual (dia 1 até último dia do mês)
- **`year`**: Eventos do ano atual (1º de janeiro até 31 de dezembro)
- **`custom`**: Período personalizado usando `startDate` e `endDate`
- **Padrão**: Últimos 30 dias se nenhum filtro for especificado

### Rate Limiting

- **Limite**: 100 requisições por minuto por site
- **Headers de resposta**: Incluem informações sobre rate limiting

### Códigos de Status

- **200**: Sucesso
- **400**: Parâmetros inválidos
- **401**: Site key inválida ou ausente
- **429**: Rate limit excedido
