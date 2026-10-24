# 🛩️ PAPER WORLD — Jogo 3D de Voo com Reconhecimento de Gestos

**Paper World** é um jogo tridimensional completo e imersivo no qual o jogador controla um avião de papel através dos movimentos naturais da própria mão captados pela câmara do computador ou telemóvel, ou através de controlos alternativos de teclado e ecrã tátil.

O jogo combina uma estética inspirada em origami e livros infantis tridimensionais, física de voo suave, anéis suspensos, colecionáveis, obstáculos dinâmicos, síntese de áudio procedural e progressão equilibrada de dificuldade.

---

## 🌟 Funcionalidades Principais

- **Voo por Gestos Naturais (MediaPipe Hands)**:
  - Movimentação suave horizontal e vertical mapeando a posição do pulso com inversão espelhada intuitiva.
  - Deteção inteligente de punho fechado para ativação temporária do modo **Turbo / Impulso**.
  - Janela de pré-visualização opcional com renderização do esqueleto da mão e cursor em tempo real.
  - Filtragem por zona morta (*deadzone*) e suavização exponencial para eliminar tremores indesejados.
- **Controlos Alternativos Integrados**:
  - **Teclado**: Teclas `WASD` ou `Setas`, `Espaço` para Turbo, `P` ou `Esc` para Pausa.
  - **Ecrã Tátil / Mobile**: Joystick virtual tátil e botão dedicado de Turbo.
- **Mundo 3D Estilizado de Origami**:
  - Modelo tridimensional do avião de papel com dobras facetadas, quilha inferior e rastos de vento nas asas.
  - Montanhas geométricas dobradas que delimitam o horizonte sem recorrer a paredes genéricas.
  - Nuvens volumétricas de papel, ilhas flutuantes com árvores origami e partículas de vento.
  - Iluminação cinematográfica com luz solar suave, luz de céu/terra balanceada e nevoeiro de horizonte.
- **Mecânicas de Jogo e Pontuação**:
  - Anéis hexagonais com deteção de passagem no plano Z e raio interno.
  - Multiplicadores de pontuação e sequência de *combos* por anéis consecutivos (até 3.5x).
  - Estrelas de papel douradas para recolha de pontos bónus.
  - Obstáculos: nuvens de tempestade e espigões vermelhos que quebram o combo e aplicam penalização controlada (sem colisões duplicadas no mesmo objeto).
  - Dificuldade progressiva suave com aumento gradual de velocidade.
- **Áudio Procedural em Tempo Real (Web Audio API)**:
  - Vento dinâmico com ruído castanho filtrado e osciladores sintetizados.
  - Efeitos sonoros de anéis, estrelas, ativação de turbo, embate e contagem decrescente (zero ficheiros externos ausentes / 404).
  - Botão de ativar/desativar som na interface.
- **Ciclo Completo de Jogo**:
  - *Landing Page* profissional com pré-visualização 3D, botões de ação e apresentação de funcionalidades.
  - Contagem decrescente 3, 2, 1 antes de cada sessão de voo.
  - HUD de telemetria de baixa oclusão com pontuação, recorde, velocidade (km/h) e distância percorrida.
  - Menus de Pausa, Fim de Partida e Definições personalizadas.
  - Persistência segura do melhor recorde em `localStorage`.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: React 19 / Vite SPA com TypeScript em modo `strict`.
- **Motor 3D**: [Three.js](https://threejs.org/) & [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber).
- **Visão Computacional**: [@mediapipe/hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) & [@mediapipe/camera_utils](https://www.npmjs.com/package/@mediapipe/camera_utils).
- **Gestão de Estado**: [Zustand](https://github.com/pmndrs/zustand).
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/).
- **Ícones**: [lucide-react](https://lucide.dev/).
- **Efeitos de Celebração**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti).
- **Testes Unitários**: [Vitest](https://vitest.dev/).

---

## 📁 Estrutura de Pastas

```text
src/
├── __tests__/                  # Testes automatizados (física, colisões, regras)
│   └── game.test.ts
├── components/
│   ├── controls/
│   │   ├── HandTracker.tsx      # Integração com MediaPipe Hands e overlay
│   │   ├── KeyboardControls.tsx # Dicas visuais dos atalhos de teclado
│   │   └── TouchControls.tsx    # Joystick virtual e botão de impulso móvel
│   ├── game/
│   │   ├── Clouds.tsx           # Nuvens volumétricas de origami instanciadas
│   │   ├── Collectibles.tsx     # Estrelas e cristais dourados
│   │   ├── FloatingIslands.tsx  # Ilhas flutuantes com vegetação estilizada
│   │   ├── GameCanvas.tsx       # Contentor do Canvas 3D, câmara e nevoeiro
│   │   ├── Lighting.tsx         # Rig de iluminação solar e preenchimento
│   │   ├── Mountains.tsx        # Montanhas dobradas no horizonte
│   │   ├── Obstacles.tsx        # Nuvens de tempestade e espigões vermelhos
│   │   ├── PaperPlane.tsx       # Modelo procedural 3D do avião de papel
│   │   ├── Particles.tsx        # Fragmentos de papel e linhas de vento
│   │   ├── Rings.tsx            # Anéis hexagonais dourados de passagem
│   │   └── World.tsx            # Gestor do mundo, reciclagem e simulação
│   └── ui/
│       ├── CameraPreview.tsx    # Janela de monitorização da câmara
│       ├── GameInstructions.tsx# Modal informativo "Como Jogar"
│       ├── GameOver.tsx         # Ecrã de fim de partida e estatísticas
│       ├── HUD.tsx              # Telemetria de voo e pontuação
│       ├── LoadingScreen.tsx    # Contagem decrescente 3, 2, 1
│       ├── MainMenu.tsx         # Landing page e menu principal
│       ├── PauseMenu.tsx        # Menu de suspensão de jogo
│       └── SettingsPanel.tsx    # Painel de definições e privacidade
├── hooks/
│   ├── useGameLoop.ts          # Controlo de loop temporal
│   ├── useIsMobile.ts          # Deteção de dispositivos móveis
│   └── useKeyboard.ts          # Captura e polling contínuo de teclas
├── lib/
│   ├── audio.ts                # Sintetizador procedural Web Audio API
│   ├── collision.ts            # Deteção geométrica de anéis e obstáculos
│   ├── controls.ts             # Coordenador unificado de entradas
│   ├── game-config.ts          # Configurações centrais de física e regras
│   ├── game-physics.ts         # Aerodinâmica e amortecimento de inclinação
│   ├── mediapipe.ts            # Classe de reconhecimento e calibração de gestos
│   ├── storage.ts              # Acesso seguro ao localStorage
│   └── utils.ts                # Utilitários de cálculo e formatação
├── store/
│   └── useGameStore.ts         # Estado global reativo com Zustand
├── types/
│   └── game.ts                 # Interfaces e tipos TypeScript estritos
├── App.tsx                     # Ponto de montagem principal e rotas
├── index.css                   # Estilos globais e Tailwind CSS
└── main.tsx                    # Ponto de entrada React 19
```

---

## 📷 Instruções para Utilizar a Câmara e Gestos

1. **Permissão de Acesso**: Ao entrar no jogo, o navegador irá solicitar permissão para aceder à câmara web. Selecione **Permitir**.
2. **Ambiente Seguro (HTTPS / Localhost)**:
   > ⚠️ **Importante**: As APIs de acesso à câmara dos navegadores modernos (`navigator.mediaDevices.getUserMedia`) exigem uma ligação segura via **HTTPS** ou execução em **localhost**. Em HTTP não seguro, o navegador bloqueará o acesso por motivos de segurança.
3. **Posicionamento**:
   - Posicione-se a cerca de 0.5 a 1.2 metros da câmara com iluminação frontal adequada.
   - Mostre a palma da mão aberta virada para a câmara.
4. **Comandos por Gesto**:
   - **Mão Aberta**: Desloque a mão para a esquerda, direita, cima ou baixo para conduzir o avião. O avião inclina-se naturalmente na direção do voo.
   - **Punho Fechado**: Feche os dedos num punho para acionar o **Turbo** instantâneo durante alguns segundos.
   - **Sem Câmara**: Pode alternar a qualquer momento para o modo de Teclado no menu de definições.

---

## 🔒 Privacidade e Segurança dos Dados

- **Processamento 100% Local**: O fluxo de vídeo da câmara é analisado exclusivamente na memória do seu próprio navegador através do WebAssembly do MediaPipe.
- **Nenhum envio para servidor**: Nenhuma imagem, vídeo ou fotograma é transmitido, gravado ou armazenado na rede.
- As permissões da câmara podem ser revogadas a qualquer momento nas definições do navegador.

---

## ⌨️ Controlos Alternativos Suportados

| Controlo | Ação |
| :--- | :--- |
| **W** ou **Seta Cima** | Subir |
| **S** ou **Seta Baixo** | Descer |
| **A** ou **Seta Esquerda** | Virar à Esquerda |
| **D** ou **Seta Direita** | Virar à Direita |
| **Espaço** | Ativar Turbo / Impulso |
| **P** ou **Escape** | Pausar / Retomar Jogo |
| **Toque no Ecrã** | Joystick virtual para dispositivos móveis |

---

## ⚙️ Configuração e Equilíbrio da Dificuldade

Todos os parâmetros de jogabilidade estão centralizados no ficheiro `src/lib/game-config.ts`:

- `speed.initial`: 18 unidades/s (velocidade inicial suave).
- `speed.max`: 45 unidades/s (velocidade máxima terminal).
- `speed.accelerationRate`: 0.15 unidades/s (progressão contínua).
- `speed.boostMultiplier`: 1.6x (multiplicador temporário durante o Turbo).
- `boost.duration`: 3.5 segundos de aceleração especial.
- `boost.cooldown`: 8.0 segundos de recarga após o impulso.
- `score.ringBase`: 150 pontos base por anel.
- `score.collectibleBase`: 50 pontos por estrela.
- `score.comboMultiplierStep`: +0.25x por cada anel consecutivo (até 3.5x).
- `score.collisionPenalty`: 100 pontos e reinício do multiplicador após embate.

---

## 🚀 Comandos de Execução

### Instalação de Dependências
```bash
npm install
```

### Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Abre a aplicação em `http://localhost:3000`.

### Executar Testes Automatizados
```bash
npm test
```

### Verificação de Tipos e Análise Estática
```bash
npm run lint
```

### Compilar para Produção
```bash
npm run build
```
Os ficheiros estáticos otimizados serão gerados na pasta `dist/`.

---

## 🔍 Resolução de Problemas Comuns

1. **A câmara não inicia ou apresenta erro de permissão**:
   - Verifique se a página está a ser servida em HTTPS ou em `localhost`.
   - Clique no ícone de cadeado na barra de endereços do navegador e confirme se a "Câmara" tem permissão "Permitir".
   - Verifique se nenhuma outra aplicação está a bloquear a câmara (Zoom, Teams, etc.).
   - Pode alternar imediatamente para o modo **Teclado** clicando no botão no menu ou nas definições.
2. **O avião não responde aos movimentos da mão**:
   - Abra a janela de pré-visualização (ícone no canto inferior direito) e certifique-se de que a mão está dentro do enquadramento.
   - Evite fundos com iluminação traseira excessiva ou pouca luminosidade no rosto/mãos.
3. **Desempenho reduzido em dispositivos mais antigos**:
   - O jogo inclui deteção automática de WebGL por software (*Software GL Guard*), adaptando a resolução e desativando sombras pesadas para manter a taxa de fotogramas fluida a 60 FPS.
