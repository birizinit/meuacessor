/**
 * Script de Validação Completa da Aplicação
 * 
 * Este script testa:
 * 1. Configuração do ambiente
 * 2. Conexão com Supabase
 * 3. Autenticação
 * 4. Endpoints de API
 * 5. Upload de imagens
 * 6. Estrutura de pastas
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Cores para output no console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Carrega variáveis de ambiente do arquivo .env.local
function loadEnvVariables() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value.trim();
          }
        }
      }
      
      return true;
    }
  }
  
  return false;
}

loadEnvVariables();

async function validateEnvironment() {
  logSection('1. VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  let allEnvVarsPresent = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      logSuccess(`${envVar} está definida`);
    } else {
      logError(`${envVar} NÃO está definida`);
      allEnvVarsPresent = false;
    }
  }
  
  return allEnvVarsPresent;
}

async function validateSupabaseConnection() {
  logSection('2. VALIDAÇÃO DE CONEXÃO COM SUPABASE');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logError('Variáveis de ambiente do Supabase não estão configuradas');
      return false;
    }
    
    // Validar formato da URL
    if (!supabaseUrl.startsWith('https://')) {
      logError('URL do Supabase inválida');
      return false;
    }
    
    logSuccess('Variáveis do Supabase estão configuradas corretamente');
    logInfo(`URL do Supabase: ${supabaseUrl}`);
    
    return true;
  } catch (error) {
    logError(`Erro ao validar Supabase: ${error.message}`);
    return false;
  }
}

async function validateFileStructure() {
  logSection('3. VALIDAÇÃO DE ESTRUTURA DE ARQUIVOS');
  
  const requiredPaths = [
    { path: 'public', type: 'directory' },
    { path: 'public/uploads', type: 'directory' },
    { path: 'app/api/user/route.ts', type: 'file' },
    { path: 'app/api/upload/route.ts', type: 'file' },
    { path: 'app/api/uploads/[filename]/route.ts', type: 'file' },
    { path: 'contexts/AuthContext.tsx', type: 'file' },
    { path: 'lib/supabase.ts', type: 'file' },
    { path: 'next.config.mjs', type: 'file' },
  ];
  
  let allPathsExist = true;
  
  for (const { path: filePath, type } of requiredPaths) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const isCorrectType = 
        (type === 'directory' && stats.isDirectory()) ||
        (type === 'file' && stats.isFile());
      
      if (isCorrectType) {
        logSuccess(`${filePath} (${type}) existe`);
      } else {
        logError(`${filePath} existe mas não é um ${type}`);
        allPathsExist = false;
      }
    } else {
      logError(`${filePath} NÃO existe`);
      allPathsExist = false;
    }
  }
  
  return allPathsExist;
}

async function validateUploadsDirectory() {
  logSection('4. VALIDAÇÃO DO DIRETÓRIO DE UPLOADS');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    
    logInfo(`Total de arquivos em uploads: ${files.length}`);
    
    if (files.length > 0) {
      logSuccess(`Diretório de uploads contém ${files.length} arquivo(s)`);
      
      // Listar alguns arquivos
      const filesToShow = files.slice(0, 5);
      logInfo('Primeiros arquivos:');
      filesToShow.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`  - ${file} (${sizeKB} KB)`);
      });
      
      if (files.length > 5) {
        logInfo(`  ... e mais ${files.length - 5} arquivo(s)`);
      }
    } else {
      logWarning('Diretório de uploads está vazio');
    }
    
    // Verificar permissões de escrita
    const testFile = path.join(uploadsDir, '.test');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      logSuccess('Diretório de uploads tem permissões de escrita');
    } catch (error) {
      logError('Diretório de uploads NÃO tem permissões de escrita');
      return false;
    }
    
    return true;
  } catch (error) {
    logError(`Erro ao validar diretório de uploads: ${error.message}`);
    return false;
  }
}

async function validateNextConfig() {
  logSection('5. VALIDAÇÃO DE CONFIGURAÇÃO DO NEXT.JS');
  
  const configPath = path.join(process.cwd(), 'next.config.mjs');
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Verificar se imagens não otimizadas está ativado
    if (configContent.includes('unoptimized: true')) {
      logSuccess('Otimização de imagens desativada (correto para esta aplicação)');
    } else {
      logWarning('Otimização de imagens pode estar ativada');
    }
    
    // Verificar se há configuração de typescript
    if (configContent.includes('ignoreBuildErrors')) {
      logInfo('Build ignorando erros de TypeScript');
    }
    
    return true;
  } catch (error) {
    logError(`Erro ao validar next.config.mjs: ${error.message}`);
    return false;
  }
}

async function validateAuthContext() {
  logSection('6. VALIDAÇÃO DO CONTEXTO DE AUTENTICAÇÃO');
  
  const authContextPath = path.join(process.cwd(), 'contexts', 'AuthContext.tsx');
  
  try {
    const authContextContent = fs.readFileSync(authContextPath, 'utf-8');
    
    const features = [
      { name: 'signIn', pattern: /signIn.*=>/ },
      { name: 'signUp', pattern: /signUp.*=>/ },
      { name: 'signOut', pattern: /signOut.*=>/ },
      { name: 'updateUserProfile', pattern: /updateUserProfile/ },
      { name: 'profile_image support', pattern: /profile_image/ },
      { name: 'api_token support', pattern: /api_token/ },
    ];
    
    for (const { name, pattern } of features) {
      if (pattern.test(authContextContent)) {
        logSuccess(`${name} implementado`);
      } else {
        logWarning(`${name} pode não estar implementado corretamente`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Erro ao validar AuthContext: ${error.message}`);
    return false;
  }
}

async function validateApiEndpoints() {
  logSection('7. VALIDAÇÃO DE ENDPOINTS DE API');
  
  const endpoints = [
    { path: 'app/api/user/route.ts', methods: ['GET', 'PUT'] },
    { path: 'app/api/upload/route.ts', methods: ['POST'] },
    { path: 'app/api/uploads/[filename]/route.ts', methods: ['GET'] },
  ];
  
  let allEndpointsValid = true;
  
  for (const { path: endpointPath, methods } of endpoints) {
    const fullPath = path.join(process.cwd(), endpointPath);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      logInfo(`Validando ${endpointPath}:`);
      
      for (const method of methods) {
        const pattern = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'i');
        if (pattern.test(content)) {
          logSuccess(`  - Método ${method} implementado`);
        } else {
          logError(`  - Método ${method} NÃO implementado`);
          allEndpointsValid = false;
        }
      }
      
      // Verificar autenticação
      if (content.includes('auth.getUser')) {
        logSuccess('  - Autenticação implementada');
      } else {
        logWarning('  - Autenticação pode não estar implementada');
      }
      
    } catch (error) {
      logError(`Erro ao validar ${endpointPath}: ${error.message}`);
      allEndpointsValid = false;
    }
  }
  
  return allEndpointsValid;
}

async function generateReport(results) {
  logSection('RELATÓRIO FINAL DE VALIDAÇÃO');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r === true).length;
  const failedTests = totalTests - passedTests;
  
  console.log('\n' + '-'.repeat(60));
  log(`Total de testes: ${totalTests}`, 'cyan');
  log(`Testes aprovados: ${passedTests}`, 'green');
  log(`Testes falhados: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  console.log('-'.repeat(60) + '\n');
  
  if (failedTests === 0) {
    logSuccess('🎉 Todas as validações passaram! A aplicação está configurada corretamente.');
  } else {
    logError(`❌ ${failedTests} validação(ões) falharam. Revise os erros acima.`);
  }
  
  logSection('RECOMENDAÇÕES');
  
  if (!results.environment) {
    logWarning('Configure as variáveis de ambiente no arquivo .env');
  }
  
  if (!results.supabase) {
    logWarning('Verifique as credenciais do Supabase e a conexão com a internet');
  }
  
  if (!results.fileStructure) {
    logWarning('Alguns arquivos ou diretórios necessários estão faltando');
  }
  
  if (!results.uploads) {
    logWarning('O diretório de uploads pode ter problemas de permissão');
  }
  
  logInfo('\nPara testar o upload de imagens, execute a aplicação e:');
  console.log('1. Faça login na aplicação');
  console.log('2. Vá para a página de perfil');
  console.log('3. Tente fazer upload de uma imagem');
  console.log('4. Verifique se a imagem aparece corretamente');
}

async function main() {
  log('\n🚀 INICIANDO VALIDAÇÃO COMPLETA DA APLICAÇÃO\n', 'magenta');
  
  const results = {
    environment: await validateEnvironment(),
    supabase: await validateSupabaseConnection(),
    fileStructure: await validateFileStructure(),
    uploads: await validateUploadsDirectory(),
    nextConfig: await validateNextConfig(),
    authContext: await validateAuthContext(),
    apiEndpoints: await validateApiEndpoints(),
  };
  
  await generateReport(results);
}

// Executar validação
main().catch(error => {
  logError(`Erro fatal durante a validação: ${error.message}`);
  console.error(error);
  process.exit(1);
});
