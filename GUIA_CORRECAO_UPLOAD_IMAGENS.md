# 🔧 Guia de Correção: Upload de Imagens (Erro 404)

## 🔍 Problema Identificado

Você está vendo este erro no console:
```
✅ Upload da imagem bem-sucedido: /uploads/profile-...
❌ Failed to load resource: the server responded with a status of 404
```

**Causa**: O sistema está fazendo fallback para armazenamento local porque o **Supabase Storage não está completamente configurado**.

## ✅ Solução: Configurar Políticas RLS

### Passo 1: Verificar o Bucket

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Storage** no menu lateral
3. Verifique se o bucket `avatars` existe
4. Se não existir, crie com:
   - **Name**: `avatars`
   - **Public bucket**: ✅ MARCAR COMO PÚBLICO
   - Clique em **Create bucket**

### Passo 2: Configurar Políticas RLS (CRÍTICO!)

⚠️ **IMPORTANTE**: Apenas criar o bucket NÃO é suficiente! Você precisa configurar as políticas de acesso.

1. No Supabase Dashboard, vá em **SQL Editor**
2. Copie e execute o conteúdo do arquivo `setup-storage-policies.sql`
3. Aguarde a execução (deve mostrar "Success")

### Passo 3: Verificar Configuração

Execute esta query no SQL Editor para verificar se as políticas foram criadas:

```sql
SELECT 
  policyname, 
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
```

Você deve ver 4 políticas:
- ✅ `Authenticated users can upload avatars` (INSERT)
- ✅ `Anyone can view avatars` (SELECT)
- ✅ `Authenticated users can update avatars` (UPDATE)
- ✅ `Authenticated users can delete avatars` (DELETE)

## 📁 Sobre Pastas no Bucket

**NÃO** é necessário criar pastas manualmente no bucket! O código cria automaticamente:

```
avatars/
  └── profiles/
      └── profile-userid-timestamp.jpg
```

O bucket `avatars` deve estar vazio inicialmente. As pastas são criadas automaticamente no primeiro upload.

## 🧪 Testar

Após configurar as políticas:

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Faça login novamente na aplicação
3. Vá em **Perfil**
4. Tente fazer upload de uma imagem

No console, você deve ver:
```
✅ Imagem salva no Supabase Storage: https://seu-projeto.supabase.co/storage/v1/object/public/avatars/profiles/...
```

## 🔍 Diagnosticar Problemas

### Erro: "Bucket not found"
- Verifique se o bucket `avatars` existe
- Verifique se o nome está correto (minúsculas)

### Erro: "Policy violation" ou "new row violates row-level security policy"
- Execute o script `setup-storage-policies.sql` novamente
- Verifique se o bucket está marcado como público

### Imagem ainda dá 404
- Verifique se as políticas de SELECT estão ativas
- Confirme que o bucket é público
- Tente acessar a URL diretamente no navegador

### Erro 401 no upload
- Faça logout e login novamente
- Verifique se o token de sessão está válido
- Confirme que está autenticado

## 📊 Logs Importantes

Após a correção, você deve ver:

```javascript
📤 Tentando salvar no Supabase Storage...
✅ Imagem salva no Supabase Storage: https://...
✅ Upload da imagem bem-sucedido: https://...
💾 Salvando imagem no banco de dados...
✅ Dados salvos com sucesso via API
```

## 🎯 Checklist de Verificação

- [ ] Bucket `avatars` criado
- [ ] Bucket marcado como **público**
- [ ] 4 políticas RLS criadas (INSERT, SELECT, UPDATE, DELETE)
- [ ] Usuário autenticado na aplicação
- [ ] Cache do navegador limpo
- [ ] Upload testado com sucesso

## ❓ Ainda com Problemas?

Se depois de seguir todos os passos ainda houver erro:

1. Abra o console do navegador (F12)
2. Vá na aba **Network**
3. Tente fazer upload novamente
4. Procure pela requisição `/api/upload`
5. Verifique a resposta completa
6. Compartilhe os logs completos

---

**Resumo**: Apenas ter o bucket NÃO é suficiente. Você DEVE configurar as políticas RLS executando o script `setup-storage-policies.sql`.
