// API Route para upload de imagem de perfil
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { createClient } from '@supabase/supabase-js'

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

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário não fornecido" },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com Service Role Key (bypassa RLS)
    // Isso é seguro porque estamos no servidor e validamos o userId
    console.log('🔐 Criando cliente Supabase com Service Role Key...')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Validar se o usuário existe no banco de dados
    console.log('🔍 Validando userId:', userId)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (userError || !userData) {
      console.log('🚫 Usuário não encontrado:', userId)
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    console.log('✅ Usuário validado:', userId)

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
    try {
      console.log('📤 Tentando salvar no Supabase Storage...')
      const timestamp = Date.now();
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `profile-${sanitizedUserId}-${timestamp}.${fileExtension}`;
      const filePath = `profiles/${fileName}`;

      // Upload para Supabase Storage usando o cliente admin (bypassa RLS)
      const { data: uploadData, error: storageError } = await supabaseAdmin
        .storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (storageError) {
        // Se o bucket não existe, criar fallback para sistema de arquivos
        console.log('⚠️ Erro no Supabase Storage, usando fallback:', storageError.message)
        throw storageError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('✅ Imagem salva no Supabase Storage:', publicUrl)

      return NextResponse.json({
        message: "Imagem enviada com sucesso",
        url: publicUrl,
      });

    } catch (storageError) {
      // Fallback para sistema de arquivos local
      console.log('📁 Usando sistema de arquivos local como fallback...')
      
      try {
        const uploadsDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `profile-${sanitizedUserId}-${timestamp}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);

        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${fileName}`;

        console.log('✅ Imagem salva localmente:', publicUrl)

        return NextResponse.json({
          message: "Imagem enviada com sucesso",
          url: publicUrl,
        });
      } catch (fileError) {
        console.error('❌ Erro ao salvar imagem localmente:', fileError)
        return NextResponse.json(
          { error: "Erro ao fazer upload da imagem" },
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
