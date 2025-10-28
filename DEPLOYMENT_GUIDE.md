# Guia de Deploy - Railway

## Pré-requisitos

1. **Conta no GitHub** (para hospedar o código)
2. **Conta no Railway** (para hospedar a aplicação)
3. **Projeto Supabase** configurado

## Passos para Deploy

### 1. Preparar o Código

```bash
# Fazer commit das alterações
git add .
git commit -m "feat: implementar sistema de upload de imagem de perfil"
git push origin main
```

### 2. Configurar Variáveis de Ambiente no Railway

No dashboard do Railway, adicione as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Database (se necessário)
DATABASE_URL=sua_url_do_banco
```

### 3. Deploy no Railway

1. **Conectar repositório GitHub**
   - Acesse [Railway.app](https://railway.app)
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

2. **Configurar build**
   - Railway detectará automaticamente que é um projeto Next.js
   - O build será executado automaticamente

3. **Configurar domínio**
   - Railway fornecerá um domínio automático
   - Você pode configurar um domínio personalizado se desejar

### 4. Configurar Supabase para Produção

1. **Atualizar URLs permitidas**
   - No Supabase Dashboard > Settings > API
   - Adicione a URL do Railway em "Site URL"
   - Adicione a URL do Railway em "Redirect URLs"

2. **Configurar RLS (Row Level Security)**
   - Certifique-se de que as políticas RLS estão configuradas
   - Teste as permissões de usuário

### 5. Testar em Produção

1. **Acesse a URL do Railway**
2. **Teste o cadastro de usuário**
3. **Teste o upload de imagem**
4. **Verifique se a imagem é salva no banco**

## Estrutura de Arquivos Importantes

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # API de upload de imagem
│   │   └── user/route.ts            # API de usuário
│   ├── login/page.tsx               # Página de login
│   ├── perfil/page.tsx              # Página de perfil
│   └── tutoriais/page.tsx           # Página de tutoriais
├── contexts/
│   └── AuthContext.tsx              # Contexto de autenticação
├── lib/
│   └── supabase.ts                  # Configuração do Supabase
└── public/
    └── uploads/                     # Diretório de uploads
```

## Verificações Pós-Deploy

- [ ] Aplicação carrega corretamente
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Upload de imagem funciona
- [ ] Imagem é salva no banco de dados
- [ ] Imagem persiste entre sessões

## Troubleshooting

### Erro de CORS
- Verificar configurações de CORS no Supabase
- Adicionar domínio do Railway nas URLs permitidas

### Erro de Upload
- Verificar se o diretório `public/uploads` existe
- Verificar permissões de escrita

### Erro de Autenticação
- Verificar variáveis de ambiente
- Verificar configurações do Supabase

## Suporte

Se encontrar problemas:
1. Verificar logs no Railway Dashboard
2. Verificar logs no Supabase Dashboard
3. Testar localmente primeiro
