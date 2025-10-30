// API Route para servir imagens de upload
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Validar filename para prevenir path traversal
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { error: "Nome de arquivo inválido" },
        { status: 400 }
      );
    }

    // Caminho do arquivo
    const filePath = join(process.cwd(), "public", "uploads", filename);

    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      console.log("❌ Arquivo não encontrado:", filePath);
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    // Ler o arquivo
    const fileBuffer = await readFile(filePath);

    // Determinar o tipo MIME baseado na extensão
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const contentType = mimeTypes[ext || ""] || "application/octet-stream";

    // Retornar a imagem com headers apropriados
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("❌ Erro ao servir imagem:", error);
    return NextResponse.json(
      { error: "Erro ao carregar imagem" },
      { status: 500 }
    );
  }
}
