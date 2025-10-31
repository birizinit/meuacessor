// API Route para servir imagens do diretório uploads
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Validar nome do arquivo para evitar path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: "Nome de arquivo inválido" },
        { status: 400 }
      );
    }

    // Caminho para o arquivo no diretório public/uploads
    const filePath = join(process.cwd(), "public", "uploads", filename);

    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      console.log('❌ Arquivo não encontrado:', filePath);
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Ler o arquivo
    const fileBuffer = await readFile(filePath);

    // Determinar o tipo de conteúdo baseado na extensão
    const extension = filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };

    const contentType = extension ? contentTypeMap[extension] || 'application/octet-stream' : 'application/octet-stream';

    // Retornar o arquivo com headers corretos
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error("Erro ao servir imagem:", error);
    return NextResponse.json(
      { error: "Erro ao carregar imagem" },
      { status: 500 }
    );
  }
}
