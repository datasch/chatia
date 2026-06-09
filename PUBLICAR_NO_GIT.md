# Como Publicar Este Projeto em um Repositorio Git

Este guia mostra como colocar o projeto ChatIA em um repositorio Git, como GitHub, GitLab ou Bitbucket.

## 1. Preparar o projeto

Entre na pasta do projeto:

```bash
cd /opt/chatia
```

Confira se arquivos sensiveis nao serao enviados:

```bash
git status --short
```

Nao envie arquivos como:

- `.env`
- `backend/.env`
- `.credentials`
- `backups/`
- `backend/public/`
- `backend/uploads/`
- `node_modules/`
- `dist/`
- `build/`

Use os arquivos `.env.example` como modelo para quem for instalar o sistema.

## 2. Criar o repositorio remoto

No GitHub, GitLab ou Bitbucket:

1. Crie um novo repositorio.
2. Escolha um nome, por exemplo `chatia`.
3. Nao marque para criar README, `.gitignore` ou license se o projeto ja tiver esses arquivos.
4. Copie a URL do repositorio remoto.

Exemplo de URL HTTPS:

```bash
https://github.com/SEU-USUARIO/chatia.git
```

Exemplo de URL SSH:

```bash
git@github.com:SEU-USUARIO/chatia.git
```

## 3. Inicializar Git, se necessario

Se a pasta ainda nao tiver Git inicializado:

```bash
git init
```

Se ja existir a pasta `.git`, pule este passo.

## 4. Configurar o remoto

Adicione o repositorio remoto:

```bash
git remote add origin https://github.com/SEU-USUARIO/chatia.git
```

Se o remoto `origin` ja existir e voce quiser trocar:

```bash
git remote set-url origin https://github.com/SEU-USUARIO/chatia.git
```

Confira:

```bash
git remote -v
```

## 5. Adicionar os arquivos

Confira primeiro o que sera versionado:

```bash
git status --short
```

Adicione os arquivos:

```bash
git add .
```

Confira novamente:

```bash
git status --short
```

Se aparecer algum arquivo sensivel, remova do stage antes do commit:

```bash
git restore --staged caminho/do/arquivo
```

## 6. Criar o primeiro commit

```bash
git commit -m "Publica codigo inicial do ChatIA"
```

## 7. Enviar para o repositorio

Se a branch principal for `main`:

```bash
git branch -M main
git push -u origin main
```

Se o repositorio usar `master`:

```bash
git branch -M master
git push -u origin master
```

## 8. Configurar ambiente em outra maquina

Quem baixar o projeto deve criar os arquivos `.env` a partir dos exemplos:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Depois edite os valores de dominio, banco, Redis e segredos JWT.

## 9. Instalar e executar

Backend:

```bash
cd backend
npm install
npm run build
npm run db:migrate
npm run db:seed
npm run start
```

Frontend:

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

Com Docker:

```bash
docker compose up -d --build
```

## 10. Distribuir por arquivo ZIP

O arquivo ZIP distribuivel deve conter o codigo e os arquivos `.env.example`, mas nao deve conter arquivos reais de senha, backups ou uploads.

Para publicar o ZIP no GitHub:

1. Acesse a pagina do repositorio.
2. Clique em **Releases**.
3. Clique em **Create a new release**.
4. Crie uma tag, por exemplo `v1.0.0`.
5. Anexe o arquivo `.zip`.
6. Publique a release.

## Observacoes de seguranca

Antes de publicar, troque qualquer senha que tenha sido usada em producao.

Nunca publique:

- Senhas reais de banco de dados.
- Chaves JWT reais.
- Tokens de API.
- Certificados privados.
- Backups de banco.
- Arquivos enviados por usuarios.
