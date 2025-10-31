# Correções - Erros 404 e 401 nas Imagens de Perfil

## Data: 2025-10-31

## Problemas Identificados

### 1. Erro 404 - Imagens não encontradas
**Sintoma:** As imagens de perfil estavam retornando erro 404 ao tentar carregá-las no navegador.

**Causa:** As imagens eram salvas em `/public/uploads/`, mas o Next.js não tem uma rota dinâmica para servir arquivos que foram adicionados após o build inicial.

**Solução:** Criada uma rota API dinâmica para servir as imagens.

### 2. Erro 401 - Falha de autenticação na API `/api/user`
**Sintoma:** Requisições para `/api/user` retornavam erro 401 (Não autorizado).

**Causa:** A ordem de validação de autenticação estava priorizando Bearer token antes de cookies de sessão, e o método de validação do token JWT do Supabase estava incorreto.

**Solução:** Alterada a ordem de prioridade e corrigido o método de validação do token JWT.

## Correções Implementadas

### 1. Nova Rota para Servir Imagens

**Arquivo criado:** `/app/api/uploads/[filename]/route.ts`

Esta rota:
- Serve arquivos de `/public/uploads/` dinamicamente
- Valida o nome do arquivo para evitar path traversal attacks
- Define os headers de Content-Type corretos baseados na extensão
- Adiciona headers de cache para melhorar performance
- Retorna 404 se o arquivo não existir

**Exemplo de uso:**
```
GET /api/uploads/profile-72c10c5b_6d6c_4823_a7ea_0f8078d9b35b-1761879675459.png
```

### 2. Correção da Autenticação em `/api/user`

**Arquivo modificado:** `/app/api/user/route.ts`

**Mudanças:**

#### Método GET (linha ~40-80)
**Antes:**
1. Tentava autenticar via Bearer token primeiro
2. Usava `supabase.auth.getUser(token)` incorretamente
3. Fallback para cookies de sessão

**Depois:**
1. Tenta autenticar via cookies de sessão primeiro (mais confiável)
2. Se falhar, tenta Bearer token criando um novo cliente Supabase com headers corretos
3. Usa `tokenSupabase.auth.getUser()` sem passar o token como parâmetro

#### Método PUT (linha ~165-213)
Mesmas correções aplicadas ao método PUT.

**Código de autenticação corrigido:**
```typescript
// Primeiro, tentar via sessão de cookies
const { data: { user }, error: sessionError } = await supabase.auth.getUser()
if (!sessionError && user) {
  authenticatedUser = user
}

// Fallback para Bearer token
if (!authenticatedUser) {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    
    // Criar novo cliente com o token nos headers
    const tokenSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { get() { return undefined } },
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    )
    
    const { data: { user: tokenUser } } = await tokenSupabase.auth.getUser()
    if (tokenUser) authenticatedUser = tokenUser
  }
}
```

## Como Testar

### Teste de Upload de Imagem
1. Faça login na aplicação
2. Vá para a página de perfil (`/perfil`)
3. Clique no ícone de edição da imagem de perfil
4. Selecione uma imagem (JPG, PNG, GIF ou WebP)
5. A imagem deve ser carregada e exibida imediatamente

### Teste de Visualização da Imagem
1. Após o upload, a imagem deve ser visível no perfil
2. Verifique no console do navegador - não deve haver erros 404
3. A imagem deve persistir após recarregar a página

### Teste de Autenticação da API
1. Abra o console do navegador
2. Execute:
```javascript
fetch('/api/user')
  .then(r => r.json())
  .then(console.log)
```
3. Você deve receber os dados do usuário (não erro 401)

## Arquivos Modificados

1. **Criado:** `/app/api/uploads/[filename]/route.ts`
   - Nova rota para servir imagens dinamicamente

2. **Modificado:** `/app/api/user/route.ts`
   - Corrigida autenticação nos métodos GET e PUT
   - Prioridade alterada: cookies → Bearer token
   - Método correto de validação do token JWT

## Logs para Depuração

Os seguintes logs foram mantidos para facilitar a depuração:

- ✅ `Usuário autenticado via sessão`
- ✅ `Usuário autenticado via token`
- ❌ `Erro ao autenticar via sessão`
- ❌ `Erro ao autenticar via token`
- 🚫 `Acesso negado - usuário não autenticado`
- ❌ `Arquivo não encontrado` (na rota de uploads)

## Próximos Passos (Opcional)

1. **Migrar para Supabase Storage:**
   - As imagens atualmente são salvas localmente em `/public/uploads/`
   - Para produção, considere usar Supabase Storage para melhor escalabilidade
   - O código de upload já tem fallback para Supabase Storage

2. **Limpeza de Imagens Antigas:**
   - Implementar limpeza automática de imagens antigas quando uma nova é carregada
   - Evitar acúmulo de arquivos não utilizados

3. **Otimização de Imagens:**
   - Implementar redimensionamento automático de imagens
   - Converter para formatos otimizados (WebP)

## Notas Técnicas

- As imagens são salvas com o padrão: `profile-{userId sanitizado}-{timestamp}.{extensão}`
- Tamanho máximo: 5MB
- Formatos aceitos: JPG, JPEG, PNG, GIF, WebP
- Validação de assinatura de arquivo (magic bytes) para segurança
- Path traversal protection na rota de servir imagens
