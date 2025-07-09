// Codex Astralis - Datos actualizados
const defaultData = {
  "pages": [
    {
      "id": "main",
      "title": "Página Principal",
      "content": [
        {
          "id": "content-1",
          "type": "embed",
          "title": "Bienvenido a Codex Astralis",
          "text": "",
          "alignment": "center",
          "embedCode": "<iframe src=\"https://archive.org/embed/trailer_20250709\" width=\"1100\" height=\"384\" frameborder=\"0\" webkitallowfullscreen=\"true\" mozallowfullscreen=\"true\" allowfullscreen=\"\"></iframe>"
        },
        {
          "id": "content-2",
          "type": "text",
          "title": "Sobre este Codex",
          "text": "Codex Astralis es una plataforma de conocimiento que combina la elegancia victoriana con la vastedad del espacio. Cada página es cuidadosamente curada para ofrecerte una experiencia única de aprendizaje y descubrimiento.",
          "alignment": "left"
        }
      ],
      "subpages": []
    }
  ],
  "currentPage": "main",
  "currentSubpage": null
};

// Credenciales de editor
const editorCredentials = {
    username: 'Editor',
    password: '06.23.08'
};

// Variable para almacenar datos temporales
let tempData = JSON.parse(JSON.stringify(defaultData));

// Variable para el estado de autenticación
let isAuthenticated = false;