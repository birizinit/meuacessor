# Configuração do Supabase Storage para Upload de Imagens

## Problema no Railway

No Railway, o sistema de arquivos é **efêmero**, ou seja, arquivos salvos localmente são perdidos a cada deploy. Por isso, precisamos usar o **Supabase Storage** para armazenar imagens de forma permanente.

## Configuração do Supabase Storage

### 1. Criar Bucket no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Marcar como público
   - Clique em **Create bucket**

### 2. Configurar Políticas de Acesso

Após criar o bucket, configure as políticas RLS:

#### Política de Inserção (Upload)
```sql
-- Permitir que usuários autenticados façam upload de suas próprias imagens
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Política de Leitura (Public)
```sql
-- Permitir leitura pública de avatares
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Política de Atualização
```sql
-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Política de Exclusão
```sql
-- Permitir que usuários excluam suas próprias imagens
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

### 3. Executar Políticas no SQL Editor

1. No Supabase Dashboard, vá para **SQL Editor**
2. Cole cada política acima
3. Execute cada uma separadamente

### 4. Verificar Configuração

Após configurar, teste:

1. Faça upload de uma imagem na aplicação
2. Verifique se a imagem aparece no Storage > avatars > profiles
3. Verifique se a URL pública funciona

## Estrutura de Arquivos no Storage

```
avatars/
  └── profiles/
      └── profile-userid-timestamp.jpg
```

## Vantagens do Supabase Storage

- ✅ **Persistência**: Arquivos não são perdidos em deploys
- ✅ **CDN**: URLs públicas com CDN rápido
- ✅ **Escalabilidade**: Não depende do sistema de arquivos do servidor
- ✅ **Segurança**: Controle de acesso via RLS
- ✅ **Gestão**: Interface para gerenciar arquivos

## Fallback

Se o Supabase Storage não estiver configurado, o sistema usará o sistema de arquivos local como fallback (funciona apenas localmente ou com storage persistente configurado no Railway).

## Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `avatars` foi criado
- Verifique se o nome está correto (case-sensitive)

### Erro: "Policy violation"
- Verifique se as políticas RLS estão configuradas
- Verifique se o usuário está autenticado

### Imagem não aparece após upload
- Verifique se o bucket é público
- Verifique se a política de leitura está configurada
- Verifique os logs da aplicação para erros
