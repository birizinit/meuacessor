# 📸 Instruções para Configurar o Supabase Storage

## Problema Identificado

As imagens estão sendo carregadas mas não aparecem porque o bucket do Supabase Storage pode não estar configurado corretamente. Isso resulta em erros 404 ao tentar acessar as imagens.

## Solução: Configurar o Bucket "avatars"

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto da aplicação

### Passo 2: Criar o Bucket "avatars"

1. No menu lateral esquerdo, clique em **Storage**
2. Clique no botão **New bucket** (ou **Create a new bucket**)
3. Preencha os campos:
   - **Name**: `avatars` (exatamente assim, sem maiúsculas)
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
   - **File size limit**: Deixe o padrão ou configure para 5MB
4. Clique em **Create bucket**

### Passo 3: Configurar Políticas de Acesso (RLS)

Agora você precisa configurar as políticas de segurança para permitir que usuários autenticados façam upload e todos possam visualizar as imagens.

1. No Supabase Dashboard, vá para **SQL Editor** no menu lateral
2. Clique em **New query**
3. Cole o seguinte SQL:

```sql
-- Política 1: Permitir que usuários autenticados façam upload de suas próprias imagens
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);

-- Política 2: Permitir leitura pública de avatares
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política 3: Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Política 4: Permitir que usuários excluam suas próprias imagens
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. Verifique se as políticas foram criadas sem erros

### Passo 4: Verificar a Configuração

1. Volte para **Storage** no menu lateral
2. Clique no bucket **avatars**
3. Você deve ver um bucket vazio (ou com a pasta `profiles/` se já fez uploads)
4. Verifique se o badge "Public" está visível ao lado do nome do bucket

### Passo 5: Testar o Upload

1. Volte para a aplicação
2. Faça login
3. Vá para **Meu perfil**
4. Clique no botão de editar imagem (ícone de lápis no avatar)
5. Selecione uma imagem
6. Verifique os logs do console (F12 > Console)
7. Você deve ver: `✅ Imagem salva no Supabase Storage`
8. A URL deve começar com: `https://[seu-projeto].supabase.co/storage/v1/object/public/avatars/...`

## Troubleshooting (Resolução de Problemas)

### Problema: "Bucket not found"

**Causa**: O bucket "avatars" não foi criado ou o nome está incorreto.

**Solução**:
1. Verifique se o bucket existe no Storage
2. Certifique-se que o nome é exatamente `avatars` (sem maiúsculas, sem espaços)

### Problema: "New row violates row-level security policy"

**Causa**: As políticas RLS não foram criadas ou estão incorretas.

**Solução**:
1. Execute o SQL das políticas novamente no SQL Editor
2. Verifique se o usuário está autenticado (tem sessão válida no Supabase)

### Problema: Imagem aparece como 404 mesmo após upload bem-sucedido

**Causa**: O bucket não está marcado como público.

**Solução**:
1. Vá para Storage > avatars
2. Clique nos 3 pontos (...) ao lado do nome do bucket
3. Clique em "Edit bucket"
4. Marque a opção "Public bucket"
5. Salve as alterações

### Problema: Upload falha e usa fallback local

**Causa**: Credenciais do Supabase não configuradas ou inválidas.

**Solução**:
1. Verifique se as variáveis de ambiente estão corretas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Reinicie o servidor de desenvolvimento
3. Teste o upload novamente

## Como Funciona Agora

### Fluxo de Upload

1. **Tentativa 1: Supabase Storage** (Recomendado para produção)
   - Tenta salvar no bucket `avatars/profiles/`
   - Se bem-sucedido, retorna URL pública completa: `https://xxx.supabase.co/storage/v1/object/public/avatars/profiles/profile-userid-timestamp.png`
   - Esta URL é permanente e funciona em qualquer ambiente

2. **Fallback: Sistema de Arquivos Local**
   - Se o Supabase falhar, salva em `public/uploads/`
   - Retorna path relativo: `/uploads/profile-userid-timestamp.png`
   - **ATENÇÃO**: Funciona apenas localmente ou com storage persistente configurado

### URLs Suportadas

A aplicação agora suporta ambos os tipos de URL:

✅ **URL do Supabase** (Recomendado):
```
https://xyz.supabase.co/storage/v1/object/public/avatars/profiles/profile-xxx-123.png
```

✅ **Path Local** (Fallback):
```
/uploads/profile-xxx-123.png
```

### Componentes Atualizados

Os seguintes componentes foram atualizados para suportar ambos os tipos de URL:

- ✅ `app/perfil/page.tsx` - Página de perfil
- ✅ `components/header.tsx` - Header com avatar
- ✅ `app/api/upload/route.ts` - API de upload com logs melhorados

## Vantagens do Supabase Storage

- ✅ **Persistência**: Imagens não são perdidas em deploys
- ✅ **CDN Global**: Carregamento rápido de qualquer lugar do mundo
- ✅ **Escalabilidade**: Suporta milhões de arquivos
- ✅ **Segurança**: Controle de acesso via RLS
- ✅ **Gestão**: Interface visual para gerenciar arquivos
- ✅ **Gratuito**: 1GB de storage no plano gratuito

## Próximos Passos

Depois de configurar o bucket:

1. ✅ Teste o upload de uma nova imagem
2. ✅ Verifique se a imagem aparece no perfil e no header
3. ✅ Verifique os logs do console para confirmar que está usando Supabase Storage
4. ✅ Se funcionar, você pode limpar as imagens antigas em `public/uploads/`

## Precisa de Ajuda?

Se após seguir todos os passos ainda tiver problemas:

1. Abra o console do navegador (F12)
2. Vá para a aba "Console"
3. Tente fazer upload de uma imagem
4. Copie TODOS os logs que aparecem
5. Compartilhe os logs para análise

Os logs devem incluir linhas como:
- 🔐 Verificando autenticação para upload...
- 📤 Tentando salvar no Supabase Storage...
- ✅ Imagem salva no Supabase Storage ou ⚠️ Erro no Supabase Storage
