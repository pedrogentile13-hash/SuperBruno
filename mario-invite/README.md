# 🍄 Super Bruno Bros — Convite Interativo

Convite de aniversário interativo temático de **Mario Bros** com mini-jogo jogável, música sintetizada e tela de convite animada. Otimizado para mobile.

---

## ✨ Funcionalidades

- **Mini-jogo** completo: Mario, Goombas, moedas, plataformas, câmera com scroll
- **Física** realista: gravidade, coyote time, pulo variável
- **Controles** touch (D-pad na tela) + teclado (desktop)
- **Áudio 100% sintetizado** via Web Audio API — zero arquivos de áudio
  - Tema Super Mario Bros (8 compassos, loop)
  - Tema Mario Kart (para o convite)
  - Efeitos: pulo, moeda, stomp, morte, level clear
- **Transição** cinematográfica (cortina preta) entre jogo e convite
- **Tela de convite** estilo Mario Kart com:
  - Efeito typewriter nas informações da festa
  - Moedas e estrelas flutuantes
  - Botões SNES
  - Pop-up de informações (estilo PAUSE do Mario Kart)
  - Integração com Google Maps e WhatsApp

---

## 🚀 Instalação e execução

### Pré-requisitos
- Node.js ≥ 18
- npm ≥ 9

### Instalar dependências
```bash
npm install
```

### Iniciar servidor de desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no navegador.

### Build de produção
```bash
npm run build
```
Os arquivos serão gerados em `/dist`.

### Preview da build
```bash
npm run preview
```

---

## ✏️ Como personalizar a festa

**Edite apenas um arquivo:** `src/config/party.js`

```js
export const PARTY_CONFIG = {
  birthday: {
    name: "Bruno",        // ← Nome da criança
    age: 5,               // ← Idade
    date: "XX/04/2026",   // ← Data da festa (ex: "19/04/2026")
    time: "18:00",        // ← Horário
    location: {
      label: "A Definir", // ← Nome do local
      mapsUrl: "https://maps.google.com/?q=Endereço+Aqui", // ← Link do Maps
    },
  },
  contact: {
    whatsapp: "5511999999999",  // ← DDI+DDD+número (sem espaços)
    message: "Confirmando presença de [NOME] na festa do Bruno! 🍄",
  },
  // ...
};
```

---

## 📱 Compatibilidade

| Plataforma          | Status |
|---------------------|--------|
| Chrome Android 90+  | ✅     |
| Safari iOS 16+      | ✅     |
| Firefox Mobile      | ✅     |
| Chrome Desktop      | ✅     |
| Safari Desktop      | ✅     |

> **Nota iOS:** O áudio só inicia após o primeiro toque do usuário (política de autoplay da Apple). O botão START inicializa o contexto de áudio.

---

## 🌐 Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Arraste a pasta /dist para app.netlify.com/drop
```

### GitHub Pages
```bash
npm run build
# Configure o GitHub Pages para servir /dist
```

---

## 📁 Estrutura do projeto

```
mario-invite/
├── index.html              # HTML principal
├── package.json
├── vite.config.js
├── src/
│   ├── main.js             # Entry point
│   ├── config/
│   │   └── party.js        # ← EDITE AQUI
│   ├── styles/
│   │   ├── global.css      # Reset, variáveis, botões SNES
│   │   ├── game.css        # Start screen, canvas, HUD, controles
│   │   └── invite.css      # Convite, modal, animações
│   ├── game/
│   │   ├── Game.js         # Engine principal
│   │   ├── Mario.js        # Personagem jogável
│   │   ├── Enemy.js        # Goomba
│   │   ├── Coin.js         # Moedas coletáveis
│   │   ├── Platform.js     # Plataformas e blocos
│   │   ├── Camera.js       # Câmera com scroll
│   │   ├── HUD.js          # Score / vidas / tempo
│   │   ├── LevelMap.js     # Mapa declarativo da fase
│   │   └── Controls.js     # Input touch + teclado
│   ├── audio/
│   │   ├── AudioEngine.js  # Web Audio API central
│   │   ├── MarioTheme.js   # Tema do jogo sintetizado
│   │   ├── MarioKartTheme.js # Tema do convite sintetizado
│   │   └── SoundFX.js      # Efeitos sonoros
│   └── invite/
│       ├── Invite.js       # Lógica da tela de convite
│       ├── Animations.js   # Moedas, estrelas, nuvens
│       ├── Modal.js        # Pop-up de informações
│       └── Transition.js   # Transição jogo → convite
└── assets/
    └── fonts/              # (opcional) Press Start 2P self-hosted
```

---

## 🎮 Controles do jogo

| Ação         | Mobile          | Desktop            |
|-------------|-----------------|-------------------|
| Mover       | ◀ ▶ (D-pad)    | ← → / A D         |
| Pular       | Botão **A**     | ↑ / W / Espaço / Z |

**Dica:** Pressione e segure o botão de pulo para pular mais alto!

---

## 🔧 Tecnologias

- **Vite** — bundler / dev server
- **Vanilla JS ES6** — sem frameworks
- **Canvas 2D** — renderização do jogo
- **Web Audio API** — síntese de áudio
- **CSS Custom Properties + Keyframes** — animações do convite
- **Press Start 2P** — fonte pixel art (Google Fonts)

---

Feito com ❤️ para o aniversário do **Bruno**! 🍄⭐🎂
