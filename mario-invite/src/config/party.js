// ══════════════════════════════════════════════════════════════════════════════
//  CONFIGURAÇÃO CENTRAL DA FESTA
//  Edite apenas este arquivo para personalizar o convite!
// ══════════════════════════════════════════════════════════════════════════════

export const PARTY_CONFIG = {
  birthday: {
    name: 'Bruno',
    age: 5,
    date: 'XX/04/2026',
    time: '18:00',
    location: {
      label: 'A Definir',
      mapsUrl: 'https://maps.google.com/?q=A+Definir', // ← editar com endereço real
    },
  },

  contact: {
    whatsapp: '5511999999999', // ← editar: DDI + DDD + número (sem espaços ou hífen)
    message: 'Confirmando presença de [NOME] na festa do Bruno! 🍄',
  },

  theme: {
    primaryColor:   '#E52521', // Vermelho Mario
    secondaryColor: '#FBD000', // Amarelo estrela
    accentColor:    '#049CD8', // Azul céu
    groundColor:    '#C84B0C', // Marrom terra
    grassColor:     '#00A800', // Verde grama
    darkColor:      '#000000', // Preto texto
  },

  // Textos exibidos no convite (editáveis)
  labels: {
    player:  'PLAYER 1',
    level:   'LEVEL',
    date:    'DATA',
    time:    'HORA',
    local:   'LOCAL',
  },

  // Configurações de áudio
  audio: {
    masterVolume: 0.4,
    sfxVolume:    0.6,
    musicVolume:  0.3,
  },
};
