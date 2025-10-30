# 🔍 Diagnóstico de Problemas com Upload de Imagens de Perfil

## ❌ Problemas Identificados

### 1. **Variáveis de Ambiente NÃO Configuradas**
- Não existe arquivo `.env.local` no projeto
- As variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estão definidas
- **Impacto**: O Supabase Storage não consegue se conectar

### 2. **Bucket do Supabase Storage Pode Não Existir**
- O código tenta fazer upload para o bucket `avatars`
- Sem variáveis de ambiente, não é possível verificar se o bucket existe
- **Impacto**: Upload falha silenciosamente e usa fallback local

### 3. **Problema na Atualização do Banco de Dados**
No arquivo `app/perfil/page.tsx`, linha 222-226:
```typescript
const { error: updateError } = await updateUserProfile({
  profile_image: data.profileImage,
  api_token: data.api_token,
  preferences: data.preferences,
})
```
- Tenta atualizar com `data.profileImage` (URL da imagem)
- Mas no `AuthContext.tsx`, o `updateUserProfile` espera `profile_image` (snake_case)
- **ESTA É A CAUSA PRINCIPAL**: O campo não está sendo salvo corretamente no banco!

### 4. **Incompatibilidade de Nomes de Campos**
- Frontend usa: `profileImage` (camelCase)
- Banco de dados usa: `profile_image` (snake_case)
- API usa: `profile_image` (snake_case)
- **Impacto**: Dados não são salvos corretamente

### 5. **Fallback para Sistema de Arquivos Local**
- As imagens estão sendo salvas em `/public/uploads/` (confirmado)
- Mas em produção (Railway), arquivos locais são **efêmeros** (são perdidos)
- **Impacto**: Funciona localmente, mas não em produção

## ✅ O Que Está Funcionando

1. ✓ Upload de arquivos está funcionando (salvando em `/public/uploads/`)
2. ✓ Validação de arquivos (tipo, tamanho, etc.) está correta
3. ✓ Interface de upload está funcionando
4. ✓ Imagens aparecem no localStorage

## 🔧 Soluções Necessárias

### Solução 1: Configurar Variáveis de Ambiente
Criar arquivo `.env.local` com:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### Solução 2: Criar Bucket no Supabase
1. Acessar Supabase Dashboard
2. Ir para Storage > New bucket
3. Nome: `avatars`
4. Marcar como "Public bucket"

### Solução 3: Configurar Políticas RLS
Executar SQL no Supabase (arquivo `SUPABASE_STORAGE_SETUP.md` tem os comandos)

### Solução 4: Corrigir Salvamento no Banco
Corrigir o código em `app/perfil/page.tsx` para usar o nome correto do campo

### Solução 5: Padronizar Nomes de Campos
Garantir que todos os lugares usem `profile_image` consistentemente

## 📊 Estado Atual

```
Upload ✅ → Salva localmente ✅ → Banco de dados ❌ (campo errado)
                              ↓
                        Supabase Storage ❌ (não configurado)
```

## 🎯 Próximos Passos

1. Configurar variáveis de ambiente
2. Criar e configurar bucket no Supabase
3. Corrigir código para salvar corretamente no banco
4. Testar fluxo completo
