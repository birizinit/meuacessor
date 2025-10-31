# Correção de URLs de Imagens de Perfil

## Problema Identificado

As imagens de perfil estavam sendo salvas no banco de dados com o caminho `/api/uploads/...` quando deveriam ser salvas apenas como `/uploads/...`.

### Por que isso é um problema?

No Next.js, arquivos no diretório `public/` são servidos automaticamente na raiz do site. Portanto:
- ✅ **Correto**: `/uploads/profile-xxx.jpg` → Acessa `public/uploads/profile-xxx.jpg`
- ❌ **Incorreto**: `/api/uploads/profile-xxx.jpg` → Tenta acessar uma rota de API que pode não existir ou não funcionar corretamente

## Correções Implementadas

### 1. API de Upload (`/app/api/upload/route.ts`)

**Linha 200**: Alterado o caminho retornado após upload bem-sucedido
```typescript
// ANTES:
const publicUrl = `/api/uploads/${fileName}`;

// DEPOIS:
const publicUrl = `/uploads/${fileName}`;
```

### 2. Página de Perfil (`/app/perfil/page.tsx`)

**Linhas 63-65**: Adicionado fallback para corrigir URLs antigas
```typescript
// Corrigir URL antiga se necessário - remover /api/ do caminho
let imageUrl = userProfile.profile_image
if (imageUrl.startsWith('/api/uploads/')) {
  imageUrl = imageUrl.replace('/api/uploads/', '/uploads/')
  console.log('🔄 URL corrigida (removendo /api/):', imageUrl)
  
  // Atualizar no banco de dados
  saveToDatabase({ profileImage: imageUrl }).catch(console.error)
}
```

### 3. Header (`/components/header.tsx`)

**Três locais corrigidos** para remover `/api/` de URLs antigas:

1. No carregamento inicial do localStorage (linhas 36-39)
2. Ao buscar dados da API (linhas 51-53)
3. No evento de mudança de imagem (linhas 76-78)

### 4. AuthContext (`/contexts/AuthContext.tsx`)

**Linhas 119-124**: Adicionado fallback ao carregar perfil do usuário
```typescript
// Corrigir URL antiga se necessário - remover /api/ do caminho
let imageUrl = data.profile_image
if (imageUrl.startsWith('/api/uploads/')) {
  imageUrl = imageUrl.replace('/api/uploads/', '/uploads/')
  console.log('🔄 URL corrigida no AuthContext:', imageUrl)
}
```

## Como Funciona Agora

### Fluxo de Upload
1. Usuário seleciona uma imagem
2. API faz upload para `public/uploads/profile-xxx.jpg`
3. API retorna URL como `/uploads/profile-xxx.jpg` ✅
4. URL é salva no banco de dados
5. Imagem é acessível via URL direta (servida pelo Next.js automaticamente)

### Fallback Automático
- Todas as URLs antigas com `/api/uploads/...` são automaticamente convertidas para `/uploads/...`
- A conversão acontece em:
  - Carregamento da página de perfil
  - Carregamento do header
  - Carregamento do contexto de autenticação
- A URL corrigida é salva no banco de dados automaticamente

## Verificação

As imagens devem agora:
- ✅ Fazer upload corretamente
- ✅ Carregar no front-end sem erro 404
- ✅ Atualizar automaticamente no header
- ✅ Persistir corretamente no banco de dados
- ✅ URLs antigas são corrigidas automaticamente

## Observação Importante

A rota de API `/app/api/uploads/[filename]/route.ts` foi mantida como fallback, mas não é mais necessária para o funcionamento normal, já que as imagens são servidas diretamente do diretório `public/`.
