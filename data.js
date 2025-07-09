// Codex Astralis - Datos por defecto
const defaultData = {
    pages: [
        {
            id: 'main',
            title: 'Página Principal',
            content: [
                {
                    id: 'content-1',
                    type: 'text',
                    title: 'Bienvenido a Codex Astralis',
                    text: 'Este es el repositorio de conocimiento donde convergen los misterios del cosmos y la sabiduría ancestral. Aquí encontrarás guías, información y recursos para tu viaje a través de las estrellas.',
                    alignment: 'center'
                },
                {
                    id: 'content-2',
                    type: 'text',
                    title: 'Sobre este Codex',
                    text: 'Codex Astralis es una plataforma de conocimiento que combina la elegancia victoriana con la vastedad del espacio. Cada página es cuidadosamente curada para ofrecerte una experiencia única de aprendizaje y descubrimiento.',
                    alignment: 'left'
                }
            ],
            subpages: []
        }
    ],
    currentPage: 'main',
    currentSubpage: null
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