# 🎅 NoelVision v1

NoelVision é uma aplicação web interativa que utiliza Inteligência Artificial Generativa (Google Gemini e Veo) para criar vídeos personalizados do Papai Noel. O projeto permite que usuários gerem mensagens de vídeo mágicas e personalizadas para o Natal.

## ✨ Funcionalidades

*   **Roteirização com IA:** O "Elfo Jingle" (powered by Gemini 1.5 Flash) ajuda a criar roteiros curtos e mágicos baseados na mensagem do usuário.
*   **Geração de Vídeo:** Integração com o modelo **Veo** (via Google GenAI) para gerar vídeos do Papai Noel falando o texto escolhido.
*   **Autenticação:** Sistema de login seguro com Firebase Auth (Google e Email/Senha).
*   **Armazenamento:** Salve seus projetos de vídeo no Firestore e armazene os vídeos gerados no Firebase Storage.
*   **Interface Mágica:** UI responsiva e temática de Natal com efeitos de vidro (glassmorphism) e neve.

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS.
*   **IA:** Google Gemini API (gemini-2.5-flash para texto, veo-3.1-fast-generate-preview para vídeo).
*   **Backend as a Service:** Firebase (Authentication, Firestore, Storage).

## 🚀 Como Executar o Projeto

### Pré-requisitos

*   Node.js (v18 ou superior) instalado.
*   Uma conta no [Google AI Studio](https://aistudio.google.com/) para obter a chave da API Gemini.
*   Um projeto no [Firebase Console](https://console.firebase.google.com/).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/noelvision.git
    cd noelvision
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    *   Duplique o arquivo `.env.example` e renomeie para `.env.local`.
    *   Preencha as chaves com suas credenciais:

    ```env
    # .env.local

    # Chave do Google AI Studio
    VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

    # Configurações do Firebase (Disponíveis em Project Settings > General > Your apps)
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    VITE_FIREBASE_MEASUREMENT_ID=...
    ```

4.  **Configure o Firebase:**
    *   No Console do Firebase, ative o **Authentication** (Google e Email/Senha).
    *   Crie um banco de dados **Firestore** e configure as regras de segurança.
    *   Ative o **Storage** e configure as regras.
    *   *Sugestão de regras de segurança para desenvolvimento (Firestore/Storage):*
        ```
        allow read, write: if request.auth != null;
        ```

5.  **Execute o projeto:**
    ```bash
    npm run dev
    ```
    O app estará disponível em `http://localhost:3000`.

## 📦 Build para Produção

Para gerar a versão otimizada para produção:

```bash
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist`.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e demonstrativos.

---
*Feito com 🎄 e IA.*