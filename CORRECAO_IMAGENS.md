# Correção de Visualização de Imagens

## Problema Identificado

As imagens estavam sendo salvas com sucesso no servidor, mas retornavam erro 404 ao serem carregadas na aplicação. O problema era que:

1. **Upload salvava em**: `/public/uploads/profile-xxx.png`
2. **URL retornada**: `/uploads/profile-xxx.png`
3. **Rota API para servir**: `/api/uploads/[filename]`
4. **URL tentada pelo navegador**: `https://meuacessor-production.up.railway.app/uploads/profile-xxx.png` ❌

## Solução Implementada

### 1. Correção do Endpoint de Upload (`/app/api/upload/route.ts`)

Alterado a URL retornada pelo upload para usar a rota API:

```typescript
// ANTES
const publicUrl = `/uploads/${fileName}`;

// DEPOIS
const publicUrl = `/api/uploads/${fileName}`;
```

### 2. Correção Automática de URLs Antigas

Adicionado código para corrigir automaticamente URLs antigas em dois lugares:

#### No componente de Perfil (`/app/perfil/page.tsx`)

```typescript
// Corrigir URL antiga se necessário
let imageUrl = userProfile.profile_image
if (imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('/api/uploads/')) {
  imageUrl = imageUrl.replace('/uploads/', '/api/uploads/')
  console.log('🔄 URL corrigida:', imageUrl)
  
  // Atualizar no banco de dados
  saveToDatabase({ profileImage: imageUrl }).catch(console.error)
}
```

#### No componente Header (`/components/header.tsx`)

```typescript
// Corrigir URL antiga se necessário
let imageUrl = savedImage
if (imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('/api/uploads/')) {
  imageUrl = imageUrl.replace('/uploads/', '/api/uploads/')
  localStorage.setItem("profileImage", imageUrl)
}
```

### 3. Script SQL para Atualizar Banco de Dados

Criado script SQL para atualizar todas as URLs antigas no banco de dados:

```sql
UPDATE users
SET profile_image = REPLACE(profile_image, '/uploads/', '/api/uploads/')
WHERE profile_image LIKE '/uploads/%'
  AND profile_image NOT LIKE '/api/uploads/%';
```

## Como Aplicar a Correção

### Opção 1: Deixar a Correção Automática Funcionar

As URLs antigas serão corrigidas automaticamente quando:
- O usuário carregar a página de perfil
- O usuário fizer upload de uma nova imagem
- O header for carregado

### Opção 2: Executar Script SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o script `fix-image-urls.sql`

## Arquivos Modificados

1. `/app/api/upload/route.ts` - URL de retorno corrigida
2. `/app/perfil/page.tsx` - Correção automática adicionada
3. `/components/header.tsx` - Correção automática adicionada
4. `/fix-image-urls.sql` - Script SQL de migração

## Arquivos Criados

1. `/fix-image-urls.js` - Script Node.js (não usado)
2. `/fix-image-urls.mjs` - Script Node.js ES6 (não usado)
3. `/fix-image-urls.sql` - Script SQL (recomendado)

## Como Funciona Agora

### Upload de Nova Imagem

1. Usuário seleciona imagem → `/api/upload` recebe o arquivo
2. Arquivo é salvo em `/public/uploads/profile-xxx.png`
3. URL retornada: `/api/uploads/profile-xxx.png` ✅
4. Aplicação usa a rota API para servir a imagem

### Carregamento de Imagem

1. Aplicação solicita: `GET /api/uploads/profile-xxx.png`
2. Rota API lê arquivo de `/public/uploads/profile-xxx.png`
3. Retorna imagem com headers corretos
4. Navegador exibe a imagem ✅

## Estrutura das Rotas

```
/api/upload           → Recebe upload, salva arquivo, retorna URL
/api/uploads/[filename] → Serve arquivos da pasta public/uploads
```

## Vantagens da Solução

1. ✅ Funciona em produção (Railway)
2. ✅ URLs antigas são corrigidas automaticamente
3. ✅ Cache configurado para melhor performance
4. ✅ Validação de segurança (sem path traversal)
5. ✅ Suporte a múltiplos formatos de imagem

## Observações Importantes

- A pasta `/public/uploads` é efêmera no Railway
- Imagens podem ser perdidas em deploys
- **Recomendação**: Migrar para Supabase Storage em produção
- O código já tem suporte a Supabase Storage, basta configurar o bucket 'avatars'

## Próximos Passos (Opcional)

Para garantir persistência das imagens em produção:

1. Criar bucket 'avatars' no Supabase Storage
2. O código de upload já tenta usar Supabase Storage primeiro
3. Se o bucket existir, as imagens serão salvas lá automaticamente
4. URLs públicas do Supabase Storage não serão perdidas em deploys
