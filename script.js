// Variables globales
let currentSection = 'home';
let currentPage = null;
let editMode = false;
let originalContent = {};
let isLoggedIn = false;
let wikiData = {
    pages: {
        home: {
            title: "Introduccion",
            content: null,
            subpages: []
        },
        technology: {
            title: "Tutoriales",
            content: null,
            subpages: []
        },
        exploration: {
            title: "Mapa",
            content: null,
            subpages: []
        },
        species: {
            title: "Historia y Lore",
            content: null,
            subpages: []
        },
        history: {
            title: "Servidor",
            content: null,
            subpages: []
        }
    }
};

// Credenciales de acceso
const ADMIN_CREDENTIALS = {
    username: "DesauOf",
    password: "KRkitty150615"
};

// --- NUEVO: Guardar y cargar desde un JSON en localStorage o archivo externo ---
const STORAGE_KEY = 'codexAstralisWikiDataJSON';
const JSON_FILE = 'wikiData.json';

// Inicialización
// Al cargar, intenta leer el JSON externo primero

document.addEventListener('DOMContentLoaded', function() {
    loadWikiDataFromFile().then(() => {
        updateUserInterface();
        setupEventListeners();
    });
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Add page form
    document.getElementById('addPageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddPage();
    });
    
    // Media form
    document.getElementById('mediaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddMedia();
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    // Botón exportar JSON
    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportWikiDataAsJson);
    }
}

// Cargar datos desde archivo JSON externo (si existe)
async function loadWikiDataFromFile() {
    try {
        const response = await fetch(JSON_FILE + '?_=' + Date.now()); // evitar caché
        if (response.ok) {
            wikiData = await response.json();
            renderAllSectionsFromWikiData();
            console.log('Wiki cargada desde archivo JSON:', wikiData);
            return;
        }
    } catch (e) {
        console.warn('No se pudo cargar wikiData.json, se usará localStorage o datos por defecto.');
    }
    // Si falla, intenta cargar desde localStorage
    loadWikiData();
}

function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isLoggedIn = true;
        updateUserInterface();
        closeLogin();
        showNotification('¡Sesión iniciada exitosamente!', 'success');
    } else {
        showNotification('Credenciales incorrectas', 'error');
    }
}

function logout() {
    isLoggedIn = false;
    updateUserInterface();
    if (editMode) {
        cancelEdit();
    }
    showNotification('Sesión cerrada', 'info');
}

function updateUserInterface() {
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editControls = document.getElementById('editControls');
    
    if (isLoggedIn) {
        userInfo.textContent = 'Editor: DesauOf';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        editControls.style.display = 'flex';
    } else {
        userInfo.textContent = 'Visitante';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        editControls.style.display = 'none';
    }
}

// Funciones de navegación
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active');
    
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    currentSection = sectionId;
    currentPage = null;
    
    // Salir del modo edición al cambiar de sección
    if (editMode) {
        cancelEdit();
    }
    
    // Actualizar navegación de páginas
    updatePageNavigation();
}

function updatePageNavigation() {
    const pageNav = document.getElementById('pageNav');
    pageNav.innerHTML = '';
    
    if (wikiData.pages[currentSection] && wikiData.pages[currentSection].subpages.length > 0) {
        wikiData.pages[currentSection].subpages.forEach(subpage => {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-btn';
            pageBtn.textContent = subpage.title;
            pageBtn.onclick = () => showSubpage(subpage.id);
            pageNav.appendChild(pageBtn);
        });
    }
}

function showSubpage(pageId) {
    const subpage = wikiData.pages[currentSection].subpages.find(p => p.id === pageId);
    if (!subpage) return;
    
    currentPage = pageId;
    
    // Actualizar botones de páginas
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Mostrar contenido de la subpágina
    const subpageContainer = document.getElementById(currentSection + '-subpages');
    subpageContainer.innerHTML = '';
    
    const subpageDiv = document.createElement('div');
    subpageDiv.className = 'subpage active';
    subpageDiv.innerHTML = `
        <div class="wiki-content">
            <div class="content-display">
                ${subpage.content || '<h2>' + subpage.title + '</h2><p>Contenido en desarrollo...</p>'}
            </div>
            <div class="edit-mode">
                <textarea class="edit-textarea" placeholder="Escribe tu contenido aquí..."></textarea>
                <div class="media-controls">
                    <button class="media-btn" onclick="insertMedia('image')">🖼️ Imagen</button>
                    <button class="media-btn" onclick="insertMedia('gif')">🎞️ GIF</button>
                    <button class="media-btn" onclick="insertMedia('video')">🎬 Video</button>
                </div>
            </div>
        </div>
    `;
    
    subpageContainer.appendChild(subpageDiv);
    
    // Ocultar contenido principal de la sección
    const mainContent = document.querySelector('#' + currentSection + ' .wiki-content');
    mainContent.style.display = 'none';
}

// Funciones de edición
function toggleEditMode() {
    if (!isLoggedIn) {
        showNotification('Debes iniciar sesión para editar', 'error');
        return;
    }
    
    editMode = !editMode;
    
    let currentSectionElement, displayDiv, editDiv, textarea;
    
    if (currentPage) {
        // Editando una subpágina
        currentSectionElement = document.querySelector('#' + currentSection + '-subpages .subpage.active');
    } else {
        // Editando contenido principal
        currentSectionElement = document.getElementById(currentSection);
    }
    
    if (!currentSectionElement) return;
    
    displayDiv = currentSectionElement.querySelector('.content-display');
    editDiv = currentSectionElement.querySelector('.edit-mode');
    textarea = currentSectionElement.querySelector('.edit-textarea');
    
    if (editMode) {
        // Guardar contenido original
        const contentKey = currentPage ? currentPage : currentSection;
        originalContent[contentKey] = displayDiv.innerHTML;
        
        // Convertir HTML a texto editable
        textarea.value = htmlToEditableText(displayDiv.innerHTML);
        
        // Mostrar modo edición
        displayDiv.style.display = 'none';
        editDiv.style.display = 'block';
        
        // Enfocar el textarea
        textarea.focus();
    } else {
        // Volver al modo vista
        displayDiv.style.display = 'block';
        editDiv.style.display = 'none';
    }
}

function saveContent() {
    if (!editMode || !isLoggedIn) return;
    let currentSectionElement, displayDiv, textarea;
    if (currentPage) {
        currentSectionElement = document.querySelector('#' + currentSection + '-subpages .subpage.active');
    } else {
        currentSectionElement = document.getElementById(currentSection);
    }
    if (!currentSectionElement) return;
    displayDiv = currentSectionElement.querySelector('.content-display');
    textarea = currentSectionElement.querySelector('.edit-textarea');
    const newContent = editableTextToHtml(textarea.value);
    displayDiv.innerHTML = newContent;
    if (currentPage) {
        const subpage = wikiData.pages[currentSection].subpages.find(p => p.id === currentPage);
        if (subpage) {
            subpage.content = newContent;
        }
    } else {
        wikiData.pages[currentSection].content = newContent;
    }
    toggleEditMode();
    saveWikiData();
    renderAllSectionsFromWikiData();
    showNotification('¡Contenido guardado exitosamente!', 'success');
}

function cancelEdit() {
    if (!editMode) return;
    
    let currentSectionElement, displayDiv, editDiv;
    
    if (currentPage) {
        currentSectionElement = document.querySelector('#' + currentSection + '-subpages .subpage.active');
    } else {
        currentSectionElement = document.getElementById(currentSection);
    }
    
    if (!currentSectionElement) return;
    
    displayDiv = currentSectionElement.querySelector('.content-display');
    editDiv = currentSectionElement.querySelector('.edit-mode');
    
    // Restaurar contenido original
    const contentKey = currentPage ? currentPage : currentSection;
    if (originalContent[contentKey]) {
        displayDiv.innerHTML = originalContent[contentKey];
    }
    
    // Volver al modo vista
    displayDiv.style.display = 'block';
    editDiv.style.display = 'none';
    editMode = false;
    
    showNotification('Edición cancelada', 'info');
}

// Funciones para agregar páginas
function showAddPage() {
    if (!isLoggedIn) {
        showNotification('Debes iniciar sesión para agregar páginas', 'error');
        return;
    }
    document.getElementById('addPageModal').style.display = 'block';
}

function closeAddPage() {
    document.getElementById('addPageModal').style.display = 'none';
    document.getElementById('addPageForm').reset();
}

function handleAddPage() {
    const title = document.getElementById('pageTitle').value;
    const category = document.getElementById('pageCategory').value;
    const content = document.getElementById('pageContent').value;
    if (!title || !category) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    const pageId = title.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
    const newPage = {
        id: pageId,
        title: title,
        content: content ? editableTextToHtml(content) : '',
        created: new Date().toISOString()
    };
    if (!wikiData.pages[category].subpages) {
        wikiData.pages[category].subpages = [];
    }
    wikiData.pages[category].subpages.push(newPage);
    saveWikiData();
    if (currentSection === category) {
        updatePageNavigation();
    }
    renderAllSectionsFromWikiData();
    closeAddPage();
    showNotification('¡Página creada exitosamente!', 'success');
}

// Funciones para agregar media
function showMedia() {
    if (!isLoggedIn) {
        showNotification('Debes iniciar sesión para agregar media', 'error');
        return;
    }
    document.getElementById('mediaModal').style.display = 'block';
}

function closeMedia() {
    document.getElementById('mediaModal').style.display = 'none';
    document.getElementById('mediaForm').reset();
}

function handleAddMedia() {
    const type = document.getElementById('mediaType').value;
    const url = document.getElementById('mediaUrl').value;
    const caption = document.getElementById('mediaCaption').value;
    
    if (!type || !url) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    insertMediaIntoTextarea(type, url, caption);
    closeMedia();
    showNotification('¡Media agregado exitosamente!', 'success');
}

function insertMedia(type) {
    const url = prompt('Introduce la URL del ' + type + ':');
    if (!url) return;
    
    const caption = prompt('Introduce una descripción (opcional):');
    insertMediaIntoTextarea(type, url, caption);
}

function insertMediaIntoTextarea(type, url, caption) {
    let currentSectionElement, textarea;
    
    if (currentPage) {
        currentSectionElement = document.querySelector('#' + currentSection + '-subpages .subpage.active');
    } else {
        currentSectionElement = document.getElementById(currentSection);
    }
    
    if (!currentSectionElement) return;
    
    textarea = currentSectionElement.querySelector('.edit-textarea');
    
    let mediaText = '';
    switch (type) {
        case 'image':
        case 'gif':
            mediaText = `[IMG:${url}]`;
            break;
        case 'video':
            mediaText = `[VIDEO:${url}]`;
            break;
    }
    
    if (caption) {
        mediaText += `[CAPTION:${caption}]`;
    }
    
    // Insertar en la posición del cursor
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    
    textarea.value = textBefore + '\n\n' + mediaText + '\n\n' + textAfter;
    textarea.focus();
    textarea.setSelectionRange(cursorPos + mediaText.length + 4, cursorPos + mediaText.length + 4);
}

// Funciones de conversión de texto
function htmlToEditableText(html) {
    return html
        .replace(/<h2[^>]*>/g, '## ')
        .replace(/<\/h2>/g, '\n\n')
        .replace(/<h3[^>]*>/g, '### ')
        .replace(/<\/h3>/g, '\n\n')
        .replace(/<p[^>]*>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<ul[^>]*>/g, '')
        .replace(/<\/ul>/g, '\n')
        .replace(/<li[^>]*>/g, '• ')
        .replace(/<\/li>/g, '\n')
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<em>/g, '*')
        .replace(/<\/em>/g, '*')
        .replace(/<div class="media-container"[^>]*>[\s\S]*?<\/div>/g, (match) => {
            // Extraer información del media
            const imgMatch = match.match(/<img[^>]*src="([^"]*)"[^>]*>/);
            const videoMatch = match.match(/<video[^>]*src="([^"]*)"[^>]*>/);
            const captionMatch = match.match(/<div class="media-caption">([^<]*)<\/div>/);
            
            if (imgMatch) {
                return `[IMG:${imgMatch[1]}]` + (captionMatch ? `[CAPTION:${captionMatch[1]}]` : '');
            } else if (videoMatch) {
                return `[VIDEO:${videoMatch[1]}]` + (captionMatch ? `[CAPTION:${captionMatch[1]}]` : '');
            }
            return '';
        })
        .replace(/<div[^>]*>/g, '')
        .replace(/<\/div>/g, '\n')
        .replace(/\n\n+/g, '\n\n')
        .trim();
}

function editableTextToHtml(text) {
    return text
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^• (.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\[IMG:(.*?)\](\[CAPTION:(.*?)\])?/g, (match, url, captionPart, caption) => {
            const captionHtml = caption ? `<div class="media-caption">${caption}</div>` : '';
            return `<div class="media-container"><img src="${url}" alt="Imagen">${captionHtml}</div>`;
        })
        .replace(/\[VIDEO:(.*?)\](\[CAPTION:(.*?)\])?/g, (match, url, captionPart, caption) => {
            const captionHtml = caption ? `<div class="media-caption">${caption}</div>` : '';
            return `<div class="media-container"><video src="${url}" controls></video>${captionHtml}</div>`;
        })
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[h|u|d])/gm, '<p>')
        .replace(/(?<!>)$/gm, '</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<[hu])/g, '$1')
        .replace(/(<\/[hu][^>]*>)<\/p>/g, '$1')
        .replace(/<p>(<div)/g, '$1')
        .replace(/(<\/div>)<\/p>/g, '$1');
}

// Funciones de persistencia de datos
function saveWikiData() {
    // Guardar el objeto wikiData como JSON en localStorage
    try {
        const json = JSON.stringify(wikiData, null, 2);
        localStorage.setItem(STORAGE_KEY, json);
        console.log('Wiki guardada en JSON:', json);
    } catch (e) {
        showNotification('Error al guardar los datos', 'error');
        console.error('Error al guardar en localStorage:', e);
    }
}

function loadWikiData() {
    // Cargar el objeto wikiData desde el JSON en localStorage
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            wikiData = JSON.parse(stored);
            renderAllSectionsFromWikiData();
            console.log('Wiki cargada desde JSON:', wikiData);
        } else {
            renderAllSectionsFromWikiData();
            console.log('Wiki vacía, puedes crear contenido.');
        }
    } catch (e) {
        showNotification('Error al cargar los datos', 'error');
        console.error('Error al cargar de localStorage:', e);
    }
}

// Agregar botón para exportar datos
function exportWikiDataAsJson() {
    const dataStr = JSON.stringify(wikiData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wikiData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Archivo wikiData.json exportado. Sube este archivo a tu repositorio para compartir los cambios.', 'info');
}

// Renderizar el contenido de cada sección desde wikiData
function renderAllSectionsFromWikiData() {
    Object.keys(wikiData.pages).forEach(sectionId => {
        const section = wikiData.pages[sectionId];
        const sectionDiv = document.getElementById(sectionId);
        if (!sectionDiv) return;
        const contentDisplay = sectionDiv.querySelector('.content-display');
        if (contentDisplay) {
            contentDisplay.innerHTML = section.content || '';
        }
        // Renderizar subpáginas si existen
        const subpagesDiv = document.getElementById(sectionId + '-subpages');
        if (subpagesDiv) {
            subpagesDiv.innerHTML = '';
            if (section.subpages && section.subpages.length > 0) {
                section.subpages.forEach(subpage => {
                    // No mostrar subpáginas aquí, solo limpiar (se muestran al hacer click)
                });
            }
        }
    });
}

// Funciones de utilidad
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Función para manejar teclas de acceso rápido
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's' && editMode) {
        e.preventDefault();
        saveContent();
    }
    
    if (e.key === 'Escape' && editMode) {
        cancelEdit();
    }
});