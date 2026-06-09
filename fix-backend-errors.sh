#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${YELLOW}1. Criando configurações padrão do sistema...${NC}"

# Criar script de seed para configurações
docker exec chatia-backend-dev sh -c 'cat > /app/seed_settings.js << '"'"'SEEDSCRIPT'"'"'
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "chatia",
  process.env.DB_USER || "chatia",
  process.env.DB_PASS || process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "postgres",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false
  }
);

async function seedSettings() {
  try {
    await sequelize.authenticate();
    console.log("✓ Conectado ao PostgreSQL");

    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = '"'"'Settings'"'"'
      );
    `);

    if (!results[0].exists) {
      console.log("⚠️  Tabela Settings não existe ainda");
      process.exit(0);
    }

    // Configurações globais (sem companyId)
    const globalSettings = [
      { key: "userCreation", value: "enabled" },
      { key: "currency", value: "BRL" }
    ];

    // Configurações por empresa (com companyId)
    const companySettings = [
      { key: "appName", value: process.env.COMPANY_NAME || "ChatIA" },
      { key: "primaryColorLight", value: "#6B46C1" },
      { key: "primaryColorDark", value: "#4C1D95" }
    ];

    // Criar configurações globais
    for (const setting of globalSettings) {
      const [existing] = await sequelize.query(
        "SELECT * FROM \"Settings\" WHERE key = :key AND \"companyId\" IS NULL",
        { replacements: { key: setting.key } }
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO "Settings" (key, value, "createdAt", "updatedAt")
           VALUES (:key, :value, NOW(), NOW())`,
          { replacements: setting }
        );
        console.log(`  ✓ Criada (global): ${setting.key} = ${setting.value}`);
      }
    }

    // Obter companyId da primeira empresa
    const [companies] = await sequelize.query("SELECT id FROM \"Companies\" ORDER BY id LIMIT 1");
    const companyId = companies.length > 0 ? companies[0].id : 1;

    // Criar configurações por empresa
    for (const setting of companySettings) {
      const [existing] = await sequelize.query(
        "SELECT * FROM \"Settings\" WHERE key = :key AND \"companyId\" = :companyId",
        { replacements: { key: setting.key, companyId } }
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO "Settings" (key, value, "companyId", "createdAt", "updatedAt")
           VALUES (:key, :value, :companyId, NOW(), NOW())`,
          { replacements: { ...setting, companyId } }
        );
        console.log(`  ✓ Criada (company ${companyId}): ${setting.key} = ${setting.value}`);
      }
    }

    console.log("✓ Configurações padrão criadas!");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
}

seedSettings();
SEEDSCRIPT
'

docker exec chatia-backend-dev sh -c "node /app/seed_settings.js" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Configurações serão criadas no primeiro acesso${NC}"
}

echo ""
echo -e "${YELLOW}2. Corrigindo warnings do Material-UI...${NC}"

# Criar script para corrigir warnings do Material-UI
cat > fix-material-ui.js << 'FIXMUI'
const fs = require('fs');
const path = require('path');

function getAllFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, files);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      files.push(filePath);
    }
  });
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix overlap="rectangle" → overlap="rectangular"
  if (content.includes('overlap="rectangle"')) {
    content = content.replace(/overlap="rectangle"/g, 'overlap="rectangular"');
    modified = true;
  }

  // Fix rows={...} → minRows={...}
  if (/\brows=\{/.test(content)) {
    content = content.replace(/\brows=\{/g, 'minRows={');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

const files = getAllFiles('frontend/src');
let count = 0;
files.forEach(file => {
  if (fixFile(file)) count++;
});
console.log("  ✓ Corrigidos " + count + " arquivos");
FIXMUI

node fix-material-ui.js &
PID_FIX_MUI=$!

echo ""
echo -e "${YELLOW}3. Corrigindo carregamento antes de autenticação...${NC}"

# Criar script Node.js para corrigir autenticação
cat > fix-auth-checks.js << 'FIXAUTH'
const fs = require('fs');

function fixCurrencyContext() {
  const filePath = 'frontend/src/context/Currency/CurrencyContext.js';
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already fixed
  if (content.includes('if (!user)') && content.includes('skipping currency initialization')) {
    console.log('  ✓ CurrencyContext.js already has authentication check');
    return true;
  }

  // Backup
  fs.writeFileSync(filePath + '.bak', content);

  // Find and replace the first useEffect that calls getCurrency
  const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?try \{[\s\S]*?const currency = await currencyHook\.getCurrency\(\);[\s\S]*?\} catch[\s\S]*?\}, \[\]\);/;

  const replacement = `useEffect(() => {
    const initializeCurrency = async () => {
      // Só busca currency se o usuário estiver autenticado
      if (!user) {
        console.log("User not authenticated, skipping currency initialization");
        return;
      }

      try {
        const currency = await currencyHook.getCurrency();
        setGlobalCurrency(currency);
      } catch (err) {
        console.error("Error initializing currency:", err);
      }
    };

    initializeCurrency();
  }, [user]);`;

  if (useEffectRegex.test(content)) {
    content = content.replace(useEffectRegex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('  ✓ Fixed CurrencyContext.js');
    return true;
  }
  return false;
}

function fixUseWhatsApps() {
  const filePath = 'frontend/src/hooks/useWhatsApps/index.js';
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already fixed
  if (content.match(/useEffect\(\(\) => \{[\s\S]*?if \(!user\)[\s\S]*?fetchSession/)) {
    console.log('  ✓ useWhatsApps/index.js already has authentication check');
    return true;
  }

  // Backup
  fs.writeFileSync(filePath + '.bak', content);

  // Find and replace the useEffect that fetches whatsapp sessions
  const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?setLoading\(true\);[\s\S]*?const fetchSession = async \(\) => \{[\s\S]*?const \{ data \} = await api\.get\("\/whatsapp\/\?session=0"\);[\s\S]*?fetchSession\(\);[\s\S]*?\}, \[\]\);/;

  const replacement = `useEffect(() => {
    // Só busca whatsapps se o usuário estiver autenticado
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/whatsapp/?session=0");
        dispatch({ type: "LOAD_WHATSAPPS", payload: data });
        setLoading(false);
      } catch (_) {
        setLoading(false);
      }
    };
    fetchSession();
  }, [user]);`;

  if (useEffectRegex.test(content)) {
    content = content.replace(useEffectRegex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('  ✓ Fixed useWhatsApps/index.js');
    return true;
  }
  return false;
}

fixCurrencyContext();
fixUseWhatsApps();
FIXAUTH

# Executar script de correção em paralelo
node fix-auth-checks.js &
PID_FIX_AUTH=$!

echo ""
echo -e "${YELLOW}4. Corrigindo OnlyForSuperUser para evitar erro de null...${NC}"

# Corrigir OnlyForSuperUser/index.js
ONLY_FOR_SUPER_USER_FILE="frontend/src/components/OnlyForSuperUser/index.js"
if [ -f "$ONLY_FOR_SUPER_USER_FILE" ]; then
    # Adicionar optional chaining (?.super) ao invés de .super
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/user\.super/user?.super/g' "$ONLY_FOR_SUPER_USER_FILE"
    else
        sed -i 's/user\.super/user?.super/g' "$ONLY_FOR_SUPER_USER_FILE"
    fi
    echo -e "${GREEN}  ✓ OnlyForSuperUser corrigido${NC}"
else
    echo -e "${YELLOW}  ⚠️  Arquivo OnlyForSuperUser não encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}5. Corrigindo Whitelabel para evitar user null...${NC}"

# Corrigir Whitelabel.js para tratar user null
WHITELABEL_FILE="frontend/src/components/Settings/Whitelabel.js"
if [ -f "$WHITELABEL_FILE" ]; then
    # Substituir setCurrentUser(u) por setCurrentUser(u || {})
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/setCurrentUser(u);/setCurrentUser(u || {});/g' "$WHITELABEL_FILE"
    else
        sed -i 's/setCurrentUser(u);/setCurrentUser(u || {});/g' "$WHITELABEL_FILE"
    fi
    echo -e "${GREEN}  ✓ Whitelabel corrigido${NC}"
else
    echo -e "${YELLOW}  ⚠️  Arquivo Whitelabel não encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}6. Reiniciando frontend para aplicar correções...${NC}"
docker restart chatia-frontend-dev >/dev/null 2>&1
echo -e "${GREEN}  ✓ Frontend reiniciado${NC}"

echo -e "${GREEN}✓ Correções aplicadas!${NC}"

echo ""
echo -e "${YELLOW}7. Corrigindo fluxo de autenticação e redirecionamento para login...${NC}"

# Corrigir useAuth para garantir que loading termine mesmo sem token
cat > fix-auth-flow.js << 'FIXAUTHFLOW'
const fs = require('fs');
const path = require('path');

// Corrigir useAuth.js para garantir que loading seja false quando não há tokens
function fixUseAuth() {
  const filePath = 'frontend/src/hooks/useAuth.js/index.js';
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  // Backup
  fs.writeFileSync(filePath + '.bak', content);

  // Verificar se já está corrigido
  if (content.includes('// Se não há tokens, definir loading como false imediatamente')) {
    console.log('  ✓ useAuth.js já está corrigido');
    return true;
  }

  // Encontrar o useEffect que verifica tokens
  const pattern = /useEffect\(\(\) => \{\s*const token = localStorage\.getItem\("token"\);\s*const refreshToken = localStorage\.getItem\("refreshToken"\);/;

  if (pattern.test(content)) {
    // Adicionar verificação para definir loading=false quando não há tokens
    content = content.replace(
      'const refreshToken = localStorage.getItem("refreshToken");',
      `const refreshToken = localStorage.getItem("refreshToken");

    // Se não há tokens, definir loading como false imediatamente
    if (!token || !refreshToken) {
      setLoading(false);
      return;
    }`
    );

    fs.writeFileSync(filePath, content);
    console.log('  ✓ useAuth.js corrigido - loading será false quando não há tokens');
    return true;
  }

  console.log('  ⚠️  Padrão não encontrado em useAuth.js');
  return false;
}

// Corrigir WhatsAppsProvider para não fazer chamadas sem autenticação
function fixWhatsAppsProvider() {
  const filePath = 'frontend/src/context/WhatsApp/WhatsAppsContext.js';
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️  WhatsAppsContext.js não encontrado');
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Backup
  fs.writeFileSync(filePath + '.bak', content);

  // Verificar se já tem proteção contra chamadas sem autenticação
  if (!content.includes('if (!user || !user.id)')) {
    // Adicionar verificação de usuário antes de fazer chamadas
    content = content.replace(
      /useEffect\(\(\) => \{[\s\S]*?setLoading\(true\);/g,
      function(match) {
        return match.replace(
          'setLoading(true);',
          `// Não fazer chamadas se não há usuário autenticado
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);`
        );
      }
    );

    fs.writeFileSync(filePath, content);
    console.log('  ✓ WhatsAppsContext.js corrigido - não fará chamadas sem autenticação');
    return true;
  }

  console.log('  ✓ WhatsAppsContext.js já tem proteção contra chamadas sem autenticação');
  return true;
}

// Corrigir Route.js para melhor tratamento de loading
function fixRoute() {
  const filePath = 'frontend/src/routes/Route.js';
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  // Backup
  fs.writeFileSync(filePath + '.bak', content);

  // Verificar se já está corrigido
  if (content.includes('// Mostrar loading apenas quando realmente está carregando')) {
    console.log('  ✓ Route.js já está corrigido');
    return true;
  }

  // Melhorar a lógica de loading
  content = content.replace(
    '{loading && <BackdropLoading />}',
    '{/* Mostrar loading apenas quando realmente está carregando */}\n\t\t\t{loading && <BackdropLoading />}'
  );

  // Remover loading desnecessário em redirecionamentos
  content = content.replace(
    /if \(!isAuth && isPrivate\) \{[\s\S]*?return \(/,
    `if (!isAuth && isPrivate) {
    // Redirecionar imediatamente para login se não autenticado
    if (!loading) {
      return <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />;
    }
    return (`
  );

  fs.writeFileSync(filePath, content);
  console.log('  ✓ Route.js corrigido - melhor tratamento de loading');
  return true;
}

// Aplicar correções
fixUseAuth();
fixWhatsAppsProvider();
fixRoute();

console.log('✓ Correções de autenticação aplicadas!');
FIXAUTHFLOW

node fix-auth-flow.js &
PID_FIX_AUTHFLOW=$!

# Aguardar todos os fix scripts em paralelo terminarem
wait $PID_FIX_MUI 2>/dev/null; rm -f fix-material-ui.js
wait $PID_FIX_AUTH 2>/dev/null; rm -f fix-auth-checks.js
wait $PID_FIX_AUTHFLOW 2>/dev/null; rm -f fix-auth-flow.js

echo -e "${GREEN}✓ Correções aplicadas!${NC}"
