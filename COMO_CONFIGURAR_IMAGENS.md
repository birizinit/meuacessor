# 🔧 Como Configurar Upload de Imagens de Perfil

## 📋 Problemas Corrigidos

✅ **Correção aplicada**: O código agora salva corretamente a imagem no banco de dados usando `profile_image` (snake_case)

## ⚙️ Configuração Necessária

### Passo 1: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
touch .env.local
```

2. Adicione as seguintes variáveis (substitua com seus valores reais):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**Onde encontrar essas informações:**
- Acesse: https://app.supabase.com
- Selecione seu projeto
- Vá para: Settings > API
- Copie:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 2: Criar Bucket no Supabase Storage

1. Acesse o Supabase Dashboard
2. Vá para **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:
   - **Name**: `avatars` (exatamente este nome!)
   - **Public bucket**: ✅ MARCAR ESTA OPÇÃO
   - **Allowed MIME types**: deixe vazio (permite todos)
   - **File size limit**: 5MB (ou conforme sua preferência)
5. Clique em **Create bucket**

### Passo 3: Configurar Políticas de Acesso (RLS)

Execute os seguintes comandos SQL no **SQL Editor** do Supabase:

#### 1. Permitir que usuários façam upload de suas próprias imagens:

```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);
```

#### 2. Permitir leitura pública de avatares:

```sql
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### 3. Permitir que usuários atualizem suas próprias imagens:

```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
);
```

#### 4. Permitir que usuários excluam suas próprias imagens:

```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
);
```

### Passo 4: Reiniciar o Servidor

```bash
npm run dev
```

## 🧪 Como Testar

1. Faça login na aplicação
2. Vá para a página de perfil
3. Clique no ícone de edição na foto de perfil
4. Selecione uma imagem
5. Verifique os logs do console:
   - ✅ "Upload da imagem bem-sucedido"
   - ✅ "Imagem salva no banco de dados com sucesso"
   - ✅ "Contexto atualizado com sucesso"

6. Verifique no Supabase Dashboard:
   - Storage > avatars > profiles → deve aparecer sua imagem
   - Table Editor > users → campo `profile_image` deve ter a URL

## 🔍 Verificar se Está Funcionando

### No Console do Navegador:
```
✅ Upload da imagem bem-sucedido: https://...
💾 Salvando imagem no banco de dados...
📸 Atualizando profile_image: https://...
✅ Dados salvos com sucesso via API
```

### No Supabase:

#### Storage:
```
avatars/
  └── profiles/
      └── profile-[userid]-[timestamp].jpg
```

#### Database (tabela users):
```
profile_image: https://[projeto].supabase.co/storage/v1/object/public/avatars/profiles/...
```

## ❌ Problemas Comuns

### Erro: "Bucket not found"
**Solução**: Verifique se criou o bucket com nome exatamente `avatars` (minúsculas)

### Erro: "Policy violation" ou "row-level security policy"
**Solução**: Execute todas as políticas SQL acima no SQL Editor do Supabase

### Erro: "Not authenticated"
**Solução**: Faça logout e login novamente para renovar a sessão

### Imagem aparece no Storage mas não no banco
**Solução**: Já foi corrigido no código! Verifique se está usando a versão atualizada.

### Imagem salva mas não aparece no perfil
**Solução**: 
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Faça logout e login novamente
3. Verifique se a URL no banco está correta

## 📊 Estrutura Atual

```
Upload de Imagem
    ↓
Tenta Supabase Storage (se configurado)
    ↓ (sucesso)
Salva URL no banco de dados ✅
    ↓
Atualiza contexto de autenticação ✅
    ↓
Atualiza interface ✅
```

Se o Supabase Storage falhar:
```
Upload de Imagem
    ↓
Fallback: Salva localmente em /public/uploads
    ↓
Salva URL local no banco de dados ✅
    ⚠️ Nota: Não funciona em produção (Railway)
```

## 🚀 Próximos Passos

1. ✅ Configure as variáveis de ambiente
2. ✅ Crie o bucket no Supabase
3. ✅ Configure as políticas RLS
4. ✅ Teste o upload
5. ✅ Verifique no banco de dados
6. 🎉 Está tudo funcionando!

## 💡 Dica

Se estiver testando localmente e quiser usar o Supabase Storage mesmo em desenvolvimento:
- Certifique-se de que o arquivo `.env.local` existe
- Reinicie o servidor após criar o arquivo
- Verifique os logs do console para confirmar a conexão
