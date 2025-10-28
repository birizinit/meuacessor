# Variáveis de Ambiente Necessárias

Para que o sistema funcione corretamente, você precisa configurar as seguintes variáveis de ambiente:

## Supabase Configuration

```bash
# URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here

# Chave anônima do Supabase (pública)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Chave de service role do Supabase (PRIVADA - não compartilhar)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Como Obter as Chaves

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Settings** > **API**
4. Copie as chaves:
   - **URL**: `Project URL`
   - **Anon Key**: `anon public`
   - **Service Role Key**: `service_role secret`

## Configuração

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as variáveis acima com suas chaves reais
3. Reinicie o servidor de desenvolvimento

## Importante

- A `SUPABASE_SERVICE_ROLE_KEY` é usada para bypassar o RLS (Row Level Security)
- **NUNCA** compartilhe ou commite a service role key
- Adicione `.env.local` ao `.gitignore`
