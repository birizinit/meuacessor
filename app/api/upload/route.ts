// API Route para upload de imagem de perfil
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateImageBuffer(buffer: Buffer): boolean {
  const signatures: { [key: string]: number[] } = {
    jpg: [0xff, 0xd8, 0xff],
    png: [0x89, 0x50, 0x4e, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46],
  };

  for (const [type, sig] of Object.entries(signatures)) {
    if (sig.every((byte, index) => buffer[index] === byte)) {
      return true;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    console.log('🔐 Verificando autenticação para upload...')
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
    
    // Se ainda não conseguir autenticar, usar userId do formData como fallback
    if (!authenticatedUser && userId) {
      console.log('🔄 Usando userId do formData como fallback:', userId)
      // Verificar se o userId existe na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()
      
      if (!userError && userData) {
        authenticatedUser = { id: userId } as any
        console.log('✅ Usuário validado via userId:', userId)
      }
    }
    
    if (!authenticatedUser) {
      console.log('🚫 Acesso negado - usuário não autenticado')
      console.log('🔍 Detalhes do erro:', authError)
      return NextResponse.json(
        { error: "Não autorizado - faça login para fazer upload de imagens" },
        { status: 401 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Apenas imagens são aceitas." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 5MB" },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Extensão de arquivo não permitida" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateImageBuffer(buffer)) {
      return NextResponse.json(
        { error: "Arquivo não é uma imagem válida" },
        { status: 400 }
      );
    }

    // Tentar salvar no Supabase Storage primeiro (melhor para produção)
    const timestamp = Date.now();
    const sanitizedUserId = authenticatedUser.id.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `profile-${sanitizedUserId}-${timestamp}.${fileExtension}`;
    
    let supabaseStorageSuccess = false;
    let publicUrl = '';
    
    try {
      console.log('📤 Tentando salvar no Supabase Storage...')
      console.log('📂 Bucket: avatars, Path: profiles/' + fileName)
      
      const filePath = `profiles/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: storageError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (storageError) {
        console.log('⚠️ Erro no Supabase Storage:', storageError.message)
        console.log('⚠️ Detalhes do erro:', JSON.stringify(storageError))
        throw storageError;
      }

      // Obter URL pública
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      publicUrl = urlData.publicUrl;
      supabaseStorageSuccess = true;
      
      console.log('✅ Imagem salva no Supabase Storage')
      console.log('🔗 URL pública:', publicUrl)

      return NextResponse.json({
        message: "Imagem enviada com sucesso",
        url: publicUrl,
        storage: 'supabase'
      });

    } catch (storageError) {
      // Fallback para sistema de arquivos local
      console.log('📁 Usando sistema de arquivos local como fallback...')
      console.log('⚠️ Motivo do fallback:', storageError instanceof Error ? storageError.message : 'Erro desconhecido')
      
      try {
        const uploadsDir = join(process.cwd(), "public", "uploads");
        
        console.log('📁 Diretório de uploads:', uploadsDir)
        console.log('📁 Verificando se diretório existe...')
        
        if (!existsSync(uploadsDir)) {
          console.log('📁 Diretório não existe, criando...')
          await mkdir(uploadsDir, { recursive: true });
          console.log('✅ Diretório criado')
        } else {
          console.log('✅ Diretório já existe')
        }

        const filePath = join(uploadsDir, fileName);
        console.log('📝 Salvando arquivo em:', filePath)

        await writeFile(filePath, buffer);
        console.log('✅ Arquivo salvo no disco')

        // Verificar se o arquivo foi realmente salvo
        if (existsSync(filePath)) {
          console.log('✅ Arquivo verificado no disco')
        } else {
          console.error('❌ Arquivo não foi salvo corretamente')
          throw new Error('Arquivo não foi salvo corretamente')
        }

        publicUrl = `/uploads/${fileName}`;

        console.log('✅ Imagem salva localmente:', publicUrl)

        return NextResponse.json({
          message: "Imagem enviada com sucesso",
          url: publicUrl,
          storage: 'local'
        });
      } catch (fileError) {
        console.error('❌ Erro ao salvar imagem localmente:', fileError)
        console.error('❌ Stack trace:', fileError instanceof Error ? fileError.stack : 'N/A')
        return NextResponse.json(
          { 
            error: "Erro ao fazer upload da imagem",
            details: fileError instanceof Error ? fileError.message : 'Erro desconhecido'
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}
