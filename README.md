<div align="center">

# 🎅✨ NoelVision: Santa's AI Video Studio

### *Transforme mensagens em vídeos mágicos do Papai Noel com o poder da IA Generativa*

[![Made with React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini_%26_Veo-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Educational-green?style=for-the-badge)](LICENSE)

![NoelVision Banner](img/diagrama.png)

[🎬 Ver Demo ao Vivo](#-demo-em-ação) • [📖 Documentação](#-índice) • [🚀 Começar Agora](#-começando-sua-jornada-mágica) • [🤝 Contribuir](#-contribuindo-para-a-magia)

</div>

---

## 📑 Índice

- [🎄 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades Mágicas](#-funcionalidades-mágicas)
- [🎬 Demo em Ação](#-demo-em-ação)
- [🎓 Apresentação do Projeto](#-apresentação-do-projeto)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [🚀 Começando Sua Jornada Mágica](#-começando-sua-jornada-mágica)
  - [📋 Pré-requisitos](#-pré-requisitos)
  - [⚙️ Instalação e Configuração](#️-instalação-e-configuração)
  - [🔑 Configuração das APIs](#-configuração-das-apis)
  - [🎯 Executando o Projeto](#-executando-o-projeto)
- [📦 Build para Produção](#-build-para-produção)
- [🎨 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contribuindo para a Magia](#-contribuindo-para-a-magia)
- [📄 Licença](#-licença)
- [🎁 Agradecimentos](#-agradecimentos)

---

## 🎄 Sobre o Projeto

**NoelVision** é uma aplicação web inovadora que usa o poder da **Inteligência Artificial Generativa** para criar vídeos personalizados do Papai Noel. Imagine poder enviar uma mensagem de Natal única para cada pessoa especial da sua vida, mas não como texto - como um **vídeo cinematográfico do próprio Papai Noel** falando diretamente com o destinatário!

### 🎯 A Missão

Criar experiências mágicas e memoráveis de Natal através da tecnologia mais avançada de IA, tornando cada mensagem de Natal verdadeiramente especial e inesquecível.

### 🌟 O Diferencial

Enquanto outras aplicações apenas geram texto ou imagens estáticas, o NoelVision combina:
- **Gemini 2.5 Flash** para roteirização criativa e contextualizada
- **Veo 3.1** para geração de vídeos cinematográficos em alta qualidade
- **Firebase** para autenticação segura e armazenamento persistente
- Interface intuitiva com tema natalino imersivo

---

## ✨ Funcionalidades Mágicas

### 🧝 Oficina do Duende Jingle
Um assistente de IA (powered by **Gemini**) que refina sua mensagem e cria múltiplas opções de roteiros mágicos, garantindo que cada palavra transmita o espírito natalino perfeito.

### 🎥 Geração de Vídeo com Veo 3.1
Integração direta com o modelo **Veo 3.1 Fast Generate Preview** da Google para criar vídeos cinematográficos em até 15 segundos com:
- Resolução 720p (16:9)
- Voz consistente e natural do Papai Noel
- Iluminação cinematográfica profissional
- Ambiente aconchegante de cabana natalina

### 🔐 Autenticação Segura
Sistema robusto de login com **Firebase Authentication**:
- Login via Google (OAuth)
- Cadastro com email e senha
- Proteção de dados e privacidade

### 💾 Armazenamento Inteligente
- **Firestore**: Salve projetos e histórico de conversas
- **Firebase Storage**: Armazene vídeos finalizados na nuvem
- **LocalStorage**: Fallback para modo offline/demo

### 🎨 Interface Imersiva
- Design glassmorphism com tema natalino
- Animação de neve dinâmica (Canvas API)
- Responsivo para desktop e mobile
- Sistema de créditos gamificado

### 🎬 Player Sequencial Inteligente
Reprodução suave de vídeos em partes com transição imperceptível, criando a ilusão de um único vídeo contínuo.

---

## 🎬 Demo em Ação

### 📹 Vídeo de Demonstração

<video width="50%" controls>
  <source src="https://firebasestorage.googleapis.com/v0/b/noel-vision.firebasestorage.app/o/videos%2F1765207248275%2Ffinal.webm?alt=media&token=70fd2656-3b66-4f01-823f-1a8f21ce38e3" type="video/webm">
</video>


🎥 [**Clique aqui para assistir a demo completa**](https://firebasestorage.googleapis.com/v0/b/noel-vision.firebasestorage.app/o/videos%2F1765207248275%2Ffinal.webm?alt=media&token=70fd2656-3b66-4f01-823f-1a8f21ce38e3)


---

## 🎓 Apresentação do Projeto

<video width="50%" controls>
  <source src="https://drive.google.com/file/d/13v4A5hbTjyrCh6H0GCfJpmZn0KiivgLc/view" type="video/webm">
</video>

### 📊 PRODUCT REQUIREMENTS DOCUMENT (PRD)


📄 [**Baixar Apresentação em PDF**](https://drive.google.com/file/d/1RSZAgPFLpOcSmQnxUoRMiUp-Big6jHLg/view?usp=drive_link)


---

## 🏗️ Arquitetura

### 📐 Diagrama de Arquitetura

O NoelVision segue uma arquitetura moderna de **JAMstack** com integração de serviços de IA:

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Landing View │  │  Dashboard   │  │ Create View  │          │
│  │ (Auth)       │→ │  (Projects)  │→ │ (AI Studio)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                   ↓                  ↓                 │
└─────────┼───────────────────┼──────────────────┼─────────────────┘
          │                   │                  │
          ↓                   ↓                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Firebase   │  │   Gemini AI  │  │ Video Merger │          │
│  │   (BaaS)     │  │   (GenAI)    │  │  (Client)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
          │                   │                  │
          ↓                   ↓                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Firebase   │  │  Google AI   │  │  Veo Model   │          │
│  │  Auth/Store  │  │   Platform   │  │  (Video Gen) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Fluxo de Dados

1. **Autenticação** → Firebase Auth valida usuário
2. **Roteirização** → Gemini refina mensagem em roteiros estruturados
3. **Geração** → Veo 3.1 cria vídeos cinematográficos (8s + 7s extensão)
4. **Processamento** → Client-side video merger combina partes
5. **Armazenamento** → Firebase Storage hospeda vídeo final
6. **Persistência** → Firestore salva metadados e histórico

---

## 🛠️ Tecnologias Utilizadas

### Frontend Core
- **[React 19.2](https://react.dev/)** - Biblioteca UI com Concurrent Features
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type Safety e Developer Experience
- **[Vite 6.2](https://vitejs.dev/)** - Build tool ultra-rápido
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Inteligência Artificial
- **[Google Gemini 2.5 Flash](https://ai.google.dev/)** - Roteirização e refinamento de texto
- **[Veo 3.1 Fast Generate Preview](https://deepmind.google/technologies/veo/)** - Geração de vídeo cinematográfico
- **[@google/genai SDK](https://www.npmjs.com/package/@google/genai)** - Cliente oficial para Google AI

### Backend as a Service
- **[Firebase Auth](https://firebase.google.com/docs/auth)** - Autenticação (Google OAuth + Email)
- **[Cloud Firestore](https://firebase.google.com/docs/firestore)** - NoSQL Database
- **[Firebase Storage](https://firebase.google.com/docs/storage)** - Armazenamento de vídeos

### UI/UX
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones modernos
- **[Google Fonts](https://fonts.google.com/)** - Mountains of Christmas + Inter

### Ferramentas de Desenvolvimento
- **Canvas API** - Animação de neve procedural
- **MediaRecorder API** - Gravação client-side de vídeo
- **Web Audio API** - Mixagem de áudio
- **LocalStorage** - Fallback e cache

---

## 🚀 Começando Sua Jornada Mágica

Siga este guia passo a passo para ter o NoelVision rodando na sua máquina em menos de 10 minutos!

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18.x ou superior ([Download aqui](https://nodejs.org/))
  ```
  node --version  # deve retornar v18.x.x ou superior
  ```

- **npm** ou **yarn** (vem com Node.js)
  ```
  npm --version   # deve retornar 9.x.x ou superior
  ```

- **Git** para clonar o repositório ([Download aqui](https://git-scm.com/))
  ```
  git --version
  ```

- Uma conta no **[Google AI Studio](https://aistudio.google.com/)** (gratuita)
- Uma conta no **[Firebase Console](https://console.firebase.google.com/)** (plano grátis é suficiente)

---

### ⚙️ Instalação e Configuração

#### Passo 1: Clone o Repositório

Abra seu terminal e execute:

```
git clone https://github.com/seu-usuario/neo-vision.git
cd neo-vision
```

#### Passo 2: Instale as Dependências

```
npm install
```

Isso vai instalar todas as dependências listadas no `package.json`, incluindo:
- React, TypeScript, Vite
- Firebase SDK
- Google GenAI SDK
- Lucide Icons e outras bibliotecas

**💡 Tempo estimado:** 1-2 minutos

---

### 🔑 Configuração das APIs

#### Passo 3: Configure o Google AI Studio (Gemini + Veo)

1. **Acesse:** [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

2. **Crie uma API Key:**
   - Clique em "Get API Key" ou "Create API Key"
   - Escolha um projeto existente ou crie um novo
   - Copie a chave gerada (formato: `AIzaSy...`)

3. **⚠️ Importante:** Esta chave dá acesso tanto ao **Gemini** quanto ao **Veo**. Guarde-a com segurança!

#### Passo 4: Configure o Firebase

1. **Acesse:** [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Crie um novo projeto:**
   - Clique em "Adicionar projeto"
   - Dê um nome (ex: `noelvision-prod`)
   - Desabilite Google Analytics (opcional para este projeto)

3. **Registre um Web App:**
   - No painel do projeto, clique no ícone `</>`  (Web)
   - Dê um nome ao app (ex: "NoelVision Web")
   - **NÃO** marque "Also set up Firebase Hosting" por enquanto
   - Clique em "Registrar app"

4. **Copie as credenciais:**
   - Você verá um objeto `firebaseConfig` com várias chaves
   - **Guarde essas informações** para o próximo passo

5. **Habilite Authentication:**
   - No menu lateral, vá em `Build > Authentication`
   - Clique em "Get started"
   - Na aba "Sign-in method", habilite:
     - ✅ **Google** (configure o nome e email de suporte)
     - ✅ **Email/Password**

6. **Configure o Firestore:**
   - No menu lateral, vá em `Build > Firestore Database`
   - Clique em "Create database"
   - Escolha um local (ex: `southamerica-east1` para Brasil)
   - **Modo:** Inicie em **modo de teste** (regras permissivas por 30 dias)
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

7. **Configure o Storage:**
   - No menu lateral, vá em `Build > Storage`
   - Clique em "Get started"
   - Use as regras padrão de teste (autenticação requerida):
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

#### Passo 5: Configure as Variáveis de Ambiente

1. **Crie o arquivo `.env.local`** na raiz do projeto:
   ```
   cp .env.example .env.local
   ```

2. **Edite o arquivo `.env.local`** e preencha com suas credenciais:

   ```
   # ===================================
   # GOOGLE AI STUDIO (Gemini + Veo)
   # ===================================
   VITE_GEMINI_API_KEY=AIzaSy...SuaChaveAqui...
   
   # ===================================
   # FIREBASE CONFIGURATION
   # ===================================
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=noelvision-prod.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=noelvision-prod
   VITE_FIREBASE_STORAGE_BUCKET=noelvision-prod.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **💾 Salve o arquivo**

**⚠️ IMPORTANTE:** 
- Nunca commite o arquivo `.env.local` para o GitHub
- O `.gitignore` já está configurado para ignorá-lo
- Compartilhe as chaves apenas através de canais seguros

---

### 🎯 Executando o Projeto

#### Passo 6: Inicie o Servidor de Desenvolvimento

```
npm run dev
```

Você verá algo assim no terminal:

```
  VITE v6.2.0  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h + enter to show help
```

#### Passo 7: Abra no Navegador

1. Acesse: **[http://localhost:3000](http://localhost:3000)**
2. Você deve ver a tela de login do NoelVision com o tema natalino! 🎄

---

### 🎬 Testando as Funcionalidades

#### 1. Crie uma Conta
- Clique em "Cadastrar"
- Use um email válido e senha (mínimo 6 caracteres)
- **Ou** faça login com Google

#### 2. Crie Seu Primeiro Vídeo
- Clique em "Nova Mensagem"
- Digite ou escolha uma sugestão, como:
  > *"Para minha filha que foi muito obediente e passou de ano."*
- Escolha uma das opções de roteiro geradas pelo Elfo Jingle
- Clique em **"Gerar Vídeo Mágico"**

#### 3. Aguarde a Mágica Acontecer ✨
O sistema irá:
1. 🎬 Gerar Parte 1 do vídeo (8 segundos) - ~30-60s
2. 🎬 Estender com Parte 2 (7 segundos) - ~30-60s
3. 🎥 Combinar as partes automaticamente
4. ☁️ Salvar no Firebase Storage

**⏱️ Tempo total:** 1-2 minutos

#### 4. Baixe ou Compartilhe
- Assista ao vídeo direto no navegador
- Clique em "Baixar e Salvar" para ter uma cópia local
- Use "Compartilhar Link" para enviar para outras pessoas

---

## 📦 Build para Produção

Quando estiver pronto para fazer deploy:

```
npm run build
```

Isso irá:
- ✅ Compilar TypeScript para JavaScript otimizado
- ✅ Minificar e comprimir assets (CSS, JS, imagens)
- ✅ Gerar source maps para debug
- ✅ Criar a pasta `dist/` com arquivos estáticos prontos

### Deploy Recomendado

#### Firebase Hosting (Recomendado)

```
# Instale o Firebase CLI globalmente
npm install -g firebase-tools

# Faça login na sua conta
firebase login

# Inicialize o Firebase no projeto
firebase init hosting

# Selecione:
# - Use existing project → escolha seu projeto
# - Public directory → dist
# - Single-page app → Yes
# - GitHub auto deploys → No (por enquanto)

# Faça deploy!
firebase deploy --only hosting
```

#### Outras Opções
- **Vercel:** `npx vercel` ([Documentação](https://vercel.com/docs))
- **Netlify:** Arraste a pasta `dist` para [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages:** Configure GitHub Actions com o workflow fornecido

---

## 🎨 Estrutura do Projeto

```
neo-vision/
├── components/
│   └── Snowfall.tsx          # Animação de neve procedural
├── services/
│   ├── firebase.ts           # Auth, Firestore, Storage
│   ├── gemini.ts             # Integração Gemini + Veo
│   ├── mockFirebase.ts       # Fallback para modo demo
│   └── videoMerger.ts        # Engine de renderização client-side
├── App.tsx                   # Componente raiz e views
├── index.tsx                 # Entry point
├── types.ts                  # TypeScript interfaces
├── vite.config.ts            # Configuração do Vite
├── tsconfig.json             # Configuração TypeScript
├── package.json              # Dependências e scripts
├── .env.example              # Template de variáveis
├── .gitignore                # Arquivos ignorados pelo Git
└── README.md                 # Você está aqui! 📍
```

### 🔑 Arquivos Principais

- **`App.tsx`**: Orquestra todas as views (Landing, Dashboard, Create, Result) e gerencia o estado global
- **`services/gemini.ts`**: Contém a lógica de:
  - Refinamento de mensagens com Gemini
  - Geração de vídeo com Veo 3.1
  - Polling de operações assíncronas
- **`services/firebase.ts`**: Abstração completa dos serviços Firebase com fallback para LocalStorage
- **`components/Snowfall.tsx`**: Efeito visual de neve usando Canvas API

---

## 🔧 Troubleshooting

### ❌ Problema: "API Key inválida" ou "Unauthorized"

**Causa:** Chave da API Gemini incorreta ou não configurada.

**Solução:**
1. Verifique se você copiou a chave corretamente de [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Certifique-se que a variável no `.env.local` é `VITE_GEMINI_API_KEY` (com o prefixo `VITE_`)
3. Reinicie o servidor de desenvolvimento após alterar o `.env.local`

---

### ❌ Problema: "Firebase: Error (auth/invalid-api-key)"

**Causa:** Configuração do Firebase incorreta.

**Solução:**
1. Revise todas as variáveis `VITE_FIREBASE_*` no `.env.local`
2. Compare com as credenciais no Firebase Console (Project Settings > General)
3. Certifique-se que o domínio está autorizado (Authentication > Settings > Authorized domains)

---

### ❌ Problema: "QUOTA_EXCEEDED" ao gerar vídeo

**Causa:** Você atingiu o limite de requisições da API do Veo.

**Solução:**
- Google AI Studio tem limites generosos no plano gratuito (Tier 1: 50 requisições/dia para Veo)
- Aguarde 24h para reset do quota
- Ou [solicite aumento de quota](https://aistudio.google.com/apikey) se for uso comercial

---

### ❌ Problema: Vídeo não carrega ou fica em branco

**Causa:** Problemas de CORS ou formato de vídeo não suportado.

**Solução:**
1. **Verifique o console do navegador** (F12 > Console) para erros detalhados
2. Certifique-se que o Firebase Storage tem CORS configurado:
   ```
   gsutil cors set cors.json gs://seu-bucket.appspot.com
   ```
   
   Conteúdo de `cors.json`:
   ```
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

3. Teste em diferentes navegadores (Chrome, Firefox, Safari)

---

### ❌ Problema: "Permission denied" no Firestore/Storage

**Causa:** Regras de segurança muito restritivas.

**Solução:**
- Temporariamente, use regras de teste (autenticação requerida):
  ```
  // Firestore
  allow read, write: if request.auth != null;
  
  // Storage
  allow read, write: if request.auth != null;
  ```

- **⚠️ Para produção**, implemente regras mais granulares validando campos específicos

---

### 💡 Dica Geral

Se algo não funcionar:
1. **Limpe o cache:** `rm -rf node_modules package-lock.json && npm install`
2. **Reinicie o servidor:** Ctrl+C e `npm run dev` novamente
3. **Verifique versões:** `node --version` deve ser ≥18
4. **Abra uma issue:** [GitHub Issues](https://github.com/seu-usuario/neo-vision/issues)

---

## 🤝 Contribuindo para a Magia

Adoramos contribuições! O NoelVision é um projeto open-source e toda ajuda é bem-vinda. 🎄

### Como Contribuir

1. **Fork** este repositório
2. Crie uma **branch** para sua feature:
   ```
   git checkout -b feature/minha-nova-feature
   ```
3. **Commit** suas mudanças com mensagens descritivas:
   ```
   git commit -m "feat: adiciona suporte para múltiplos idiomas"
   ```
4. **Push** para sua branch:
   ```
   git push origin feature/minha-nova-feature
   ```
5. Abra um **Pull Request** explicando suas alterações

### 🎯 Áreas que Precisam de Ajuda

- [ ] Internacionalização (i18n) - Suporte para outros idiomas
- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] Modo offline completo com Service Workers
- [ ] Integração com outras plataformas de IA (Anthropic Claude, etc.)
- [ ] Sistema de créditos com pagamento (Stripe)
- [ ] Editor de vídeo avançado (trim, filtros, legendas)
- [ ] Suporte para vídeos verticais (TikTok, Reels)

### 📜 Convenções de Código

- Use **TypeScript** para type safety
- Siga o padrão **ESLint/Prettier** configurado
- Componentes funcionais com **React Hooks**
- Comentários em português (facilita para a comunidade BR)
- Commits no padrão **Conventional Commits**

---

## 📄 Licença

Este projeto é desenvolvido para **fins educacionais e demonstrativos** no contexto de hackathons e aprendizado de IA Generativa.

```
MIT License

Copyright (c) 2025 Seu Nome

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

**Resumo:** Você pode usar, modificar e distribuir livremente, mas sem garantias.

---

## 🎁 Agradecimentos

### 🙏 Tecnologias e Ferramentas

- **[Google](https://ai.google.dev/)** - Gemini e Veo APIs
- **[Firebase](https://firebase.google.com/)** - BaaS completo
- **[React Team](https://react.dev/)** - Framework incrível
- **[Vite](https://vitejs.dev/)** - Build tool super rápido
- **[Lucide](https://lucide.dev/)** - Ícones lindos

### 🎄 Inspiração

Inspirado pelo espírito natalino e pelo desejo de tornar a tecnologia de IA acessível e divertida para todos.

### 🤖 Comunidade

Obrigado a todos que testaram, reportaram bugs e contribuíram com ideias!

---

<div align="center">

### ✨ *"Que a magia do Natal e o poder da IA tragam alegria para todos!"* 🎅

---

**Feito com ❤️, ☕ e muita IA Generativa**

[![GitHub](https://img.shields.io/badge/GitHub-@seu--usuario-181717?style=for-the-badge&logo=github)](https://github.com/jcnok)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Seu_Nome-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/juliookuda)


**⭐ Se você gostou do projeto, não esqueça de dar uma estrela!**

</div>
```



