# 🔍 Questionário de Diagnóstico - Imagens de Perfil

Para resolver completamente o problema das imagens, preciso que você responda algumas perguntas rápidas:

## 1. Supabase Storage

**❓ Você já criou o bucket "avatars" no Supabase Storage?**
- [ ] Sim, o bucket existe
- [ ] Não, ainda não criei
- [ ] Não sei como verificar

**Se SIM:**
- [ ] O bucket está marcado como PÚBLICO (Public)?
- [ ] As políticas RLS foram criadas usando o SQL fornecido?

## 2. Variáveis de Ambiente

**❓ As variáveis do Supabase estão configuradas?**

Execute no terminal:
```bash
echo "SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "SUPABASE_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
```

**Resultado:**
- [ ] As duas variáveis aparecem com valores
- [ ] Uma ou ambas estão vazias
- [ ] Não sei como verificar

## 3. Banco de Dados

**❓ A coluna `profile_image` existe na tabela `users`?**

Execute no Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'profile_image';
```

**Resultado:**
- [ ] A coluna existe (retorna 1 linha)
- [ ] A coluna não existe (retorna 0 linhas)
- [ ] Erro ao executar

## 4. Teste Rápido

**❓ Faça upload de uma nova imagem AGORA e compartilhe:**

### No Console do Navegador (F12 > Console), procure por:

1. **Linha que começa com `✅ Upload da imagem bem-sucedido:`**
   - Qual URL aparece? (copie e cole aqui)
   ```
   URL: ___________________________________
   ```

2. **Procure por `storage: 'supabase'` ou `storage: 'local'`**
   - Qual storage foi usado?
   ```
   Storage usado: ___________________
   ```

3. **Se houver erro com `⚠️` ou `❌`, copie a mensagem completa:**
   ```
   Erro: _________________________________
   ```

### Nos Logs do Servidor (Terminal do Next.js):

1. **Procure por linhas com emoji 📤, ✅ ou ❌**
   - Copie e cole todas as linhas relacionadas ao upload:
   ```
   Logs do servidor:
   _________________________________________
   _________________________________________
   _________________________________________
   ```

## 5. Ambiente de Desenvolvimento

**❓ Onde você está executando a aplicação?**
- [ ] Localmente (localhost)
- [ ] Railway (produção)
- [ ] Vercel (produção)
- [ ] Outro: ______________

## 6. Teste de Acesso à Imagem

**❓ Após o upload, copie a URL da imagem que apareceu no log**

Exemplo:
```
URL copiada: https://xxx.supabase.co/storage/v1/object/public/avatars/profiles/profile-xxx-123.png
```
ou
```
URL copiada: /uploads/profile-xxx-123.png
```

**Agora tente acessar essa URL:**

### Se começar com `https://` (Supabase):
- Cole a URL diretamente no navegador
- O que acontece?
  - [ ] A imagem carrega normalmente
  - [ ] Erro 404 (não encontrada)
  - [ ] Erro 403 (sem permissão)
  - [ ] Outro erro: ______________

### Se começar com `/uploads/` (Local):
- Cole `http://localhost:3000/uploads/nome-do-arquivo.png` no navegador
- O que acontece?
  - [ ] A imagem carrega normalmente
  - [ ] Erro 404 (não encontrada)
  - [ ] Outro erro: ______________

## 7. Verificação do Arquivo (Apenas para storage local)

**❓ Se usou storage local, verifique se o arquivo foi salvo:**

Execute no terminal:
```bash
ls -lh public/uploads/ | tail -5
```

**Cole o resultado aqui:**
```
Resultado:
_________________________________________
_________________________________________
```

**Perguntas:**
- [ ] O arquivo com timestamp recente aparece na listagem?
- [ ] Qual o tamanho do arquivo? (ex: 150K, 2.5M)

## 8. Verificação no Banco de Dados

**❓ Execute no Supabase SQL Editor:**

```sql
SELECT 
  id, 
  email, 
  profile_image,
  updated_at
FROM users
WHERE email = 'SEU_EMAIL_AQUI'
ORDER BY updated_at DESC
LIMIT 1;
```

**Cole o resultado (apenas a URL da profile_image):**
```
profile_image: _________________________________
updated_at: ____________________________________
```

## 📊 Resumo Rápido

Com base nas respostas acima, marque o cenário mais próximo:

### Cenário A: Tudo local
- [ ] Storage usado: `local`
- [ ] URL começa com `/uploads/`
- [ ] Arquivo existe em `public/uploads/`
- [ ] **MAS** erro 404 ao acessar

### Cenário B: Tentou Supabase, falhou, usou local
- [ ] Vejo logs de erro do Supabase
- [ ] Storage usado: `local` (fallback)
- [ ] Bucket não existe ou não está configurado

### Cenário C: Usando Supabase com sucesso
- [ ] Storage usado: `supabase`
- [ ] URL começa com `https://`
- [ ] Imagem carrega ao acessar a URL diretamente
- [ ] **MAS** não aparece no perfil/header

### Cenário D: Supabase configurado mas dá erro
- [ ] Storage usado: tentou `supabase`
- [ ] Erro 403 (sem permissão)
- [ ] Ou erro "Policy violation"

## 🎯 Próximos Passos Baseados nas Respostas

### Se Cenário A:
Problema na rota de servir imagens locais. Vamos verificar `/api/uploads/[filename]/route.ts`

### Se Cenário B:
Configurar Supabase Storage seguindo `INSTRUCOES_CONFIGURAR_SUPABASE_STORAGE.md`

### Se Cenário C:
Problema no componente de exibição. Vamos verificar o código do Image.

### Se Cenário D:
Problema nas políticas RLS do Supabase. Executar `setup-supabase-storage.sql`

---

## 📤 Como Compartilhar suas Respostas

Você pode:
1. Responder diretamente no chat
2. Criar um arquivo de texto com as respostas
3. Tirar screenshots dos logs e compartilhar

Quanto mais informações você fornecer, mais rápido conseguirei resolver o problema! 🚀
