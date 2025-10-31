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

    // Verificar autenticação - priorizar cookies de sessão
    let authenticatedUser = null
    let authError = null
    
    // Primeiro, tentar autenticar via sessão de cookies (mais confiável)
    console.log('🔄 Tentando autenticar via cookies de sessão...')
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (!sessionError && user) {
      authenticatedUser = user
      console.log('✅ Usuário autenticado via sessão:', user.id)
    } else {
      console.log('❌ Erro ao autenticar via sessão:', sessionError?.message)
      authError = sessionError
    }
    
    // Se não conseguiu autenticar via sessão, tentar via Bearer token
    if (!authenticatedUser) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('🔑 Tentando autenticar via Bearer token...')
        const token = authHeader.replace('Bearer ', '')
        
        // Criar novo cliente Supabase com o token
        const tokenSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get() { return undefined }
            },
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        )
        
        const { data: { user: tokenUser }, error: tokenError } = await tokenSupabase.auth.getUser()
        if (!tokenError && tokenUser) {
          authenticatedUser = tokenUser
          console.log('✅ Usuário autenticado via token:', tokenUser.id)
        } else {
          console.log('❌ Erro ao autenticar via token:', tokenError?.message)
          authError = tokenError
        }
      }
    }
    
    if (!authenticatedUser) {
      console.log('🚫 Acesso negado - usuário não autenticado')
      console.log('🔍 Detalhes do erro:', authError)
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    console.log('👤 Usuário autenticado:', authenticatedUser.id)

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

    // Verificar autenticação - priorizar cookies de sessão
    let authenticatedUser = null
    let authError = null
    
    // Primeiro, tentar autenticar via sessão de cookies (mais confiável)
    console.log('🔄 Tentando autenticar via cookies de sessão...')
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (!sessionError && user) {
      authenticatedUser = user
      console.log('✅ Usuário autenticado via sessão:', user.id)
    } else {
      console.log('❌ Erro ao autenticar via sessão:', sessionError?.message)
      authError = sessionError
    }
    
    // Se não conseguiu autenticar via sessão, tentar via Bearer token
    if (!authenticatedUser) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('🔑 Tentando autenticar via Bearer token...')
        const token = authHeader.replace('Bearer ', '')
        
        // Criar novo cliente Supabase com o token
        const tokenSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get() { return undefined }
            },
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        )
        
        const { data: { user: tokenUser }, error: tokenError } = await tokenSupabase.auth.getUser()
        if (!tokenError && tokenUser) {
          authenticatedUser = tokenUser
          console.log('✅ Usuário autenticado via token:', tokenUser.id)
        } else {
          console.log('❌ Erro ao autenticar via token:', tokenError?.message)
          authError = tokenError
        }
      }
    }
    
    if (!authenticatedUser) {
      console.log('🚫 Acesso negado - usuário não autenticado')
      console.log('🔍 Detalhes do erro:', authError)
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    console.log('👤 Usuário autenticado:', authenticatedUser.id)

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
        profile_image: updatedUser.profile_image,
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