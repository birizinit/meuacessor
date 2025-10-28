// API Route para gerenciar dados do usuário
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function safeParseJSON(jsonString: string | null): any {
  if (!jsonString || jsonString.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

// GET - Buscar dados do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Verificando autenticação para GET /api/user...')
    const cookieStore = await cookies()
    
    console.log('🍪 Cookies disponíveis:', cookieStore.getAll().map(c => c.name))
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`🍪 Cookie ${name}:`, cookie?.value ? 'presente' : 'ausente')
            return cookie?.value
          },
        },
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 Usuário autenticado:', user?.id || 'nenhum')
    console.log('❌ Erro de autenticação:', authError?.message || 'nenhum')
    
    // Se não conseguir obter o usuário pela sessão, tentar obter pelo token de autorização
    let authenticatedUser = user
    if (!user && !authError) {
      console.log('🔄 Tentando obter usuário pelo token de autorização...')
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
        if (!tokenError && tokenUser) {
          authenticatedUser = tokenUser
          console.log('✅ Usuário autenticado via token:', tokenUser.id)
        }
      }
    }
    
    if (authError || !authenticatedUser) {
      console.log('🚫 Acesso negado - usuário não autenticado')
      console.log('🔍 Detalhes do erro:', authError)
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário na tabela users
    console.log('🔍 Buscando perfil do usuário:', authenticatedUser.id)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authenticatedUser.id)
      .single()

    console.log('🔍 Resultado da busca:', { userProfile, profileError })

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const responseData = {
      id: userProfile.id,
      email: userProfile.email,
      nome: userProfile.nome,
      sobrenome: userProfile.sobrenome,
      cpf: userProfile.cpf,
      telefone: userProfile.telefone,
      nascimento: userProfile.nascimento,
      api_token: userProfile.api_token,
      profileImage: userProfile.profile_image,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
    }

    console.log('✅ Dados retornados para o frontend:', responseData)
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do usuário
export async function PUT(request: NextRequest) {
  try {
    console.log('🔐 Verificando autenticação para PUT /api/user...')
    const cookieStore = await cookies()
    
    console.log('🍪 Cookies disponíveis:', cookieStore.getAll().map(c => c.name))
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`🍪 Cookie ${name}:`, cookie?.value ? 'presente' : 'ausente')
            return cookie?.value
          },
        },
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 Usuário autenticado:', user?.id || 'nenhum')
    console.log('❌ Erro de autenticação:', authError?.message || 'nenhum')
    
    // Se não conseguir obter o usuário pela sessão, tentar obter pelo token de autorização
    let authenticatedUser = user
    if (!user && !authError) {
      console.log('🔄 Tentando obter usuário pelo token de autorização...')
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
        if (!tokenError && tokenUser) {
          authenticatedUser = tokenUser
          console.log('✅ Usuário autenticado via token:', tokenUser.id)
        }
      }
    }
    
    if (authError || !authenticatedUser) {
      console.log('🚫 Acesso negado - usuário não autenticado')
      console.log('🔍 Detalhes do erro:', authError)
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, sobrenome, cpf, telefone, nascimento, api_token, profileImage } = body;

    // Construir objeto de atualização apenas com campos fornecidos
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (nome !== undefined) updateData.nome = nome;
    if (sobrenome !== undefined) updateData.sobrenome = sobrenome;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (nascimento !== undefined) updateData.nascimento = nascimento;
    if (api_token !== undefined) updateData.api_token = api_token;
    if (profileImage !== undefined) updateData.profile_image = profileImage;

    console.log('📝 Dados para atualização:', updateData);

    // Atualizar dados do usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', authenticatedUser.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError)
      return NextResponse.json(
        { 
          error: "Erro ao atualizar usuário: " + updateError.message,
          details: updateError
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nome: updatedUser.nome,
        sobrenome: updatedUser.sobrenome,
        cpf: updatedUser.cpf,
        telefone: updatedUser.telefone,
        nascimento: updatedUser.nascimento,
        api_token: updatedUser.api_token,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}