// Codex Astralis - Script Principal

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const cancelLogin = document.getElementById('cancel-login');
    const editorPanel = document.getElementById('editor-panel');
    const contentModal = document.getElementById('content-modal');
    const navList = document.getElementById('nav-list');
    const subpageNav = document.getElementById('subpage-nav');
    const pageTitle = document.getElementById('page-title');
    const pageContent = document.getElementById('page-content');
    
    // Botones del editor
    const addPageBtn = document.getElementById('add-page-btn');
    const addSubpageBtn = document.getElementById('add-subpage-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');
    const downloadJsonBtn = document.getElementById('download-json-btn');
    const saveContentBtn = document.getElementById('save-content');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // Variables para edición
    let currentEditingItem = null;
    let currentEditingPage = null;
    let currentEditingSubpage = null;

    // Inicializar la aplicación
    init();

    function init() {
        renderNavigation();
        renderCurrentPage();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Autenticación
        loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
        logoutBtn.addEventListener('click', logout);
        cancelLogin.addEventListener('click', () => loginModal.style.display = 'none');
        loginForm.addEventListener('submit', handleLogin);
        
        // Editor
        addPageBtn.addEventListener('click', addNewPage);
        addSubpageBtn.addEventListener('click', addNewSubpage);
        saveChangesBtn.addEventListener('click', saveChanges);
        downloadJsonBtn.addEventListener('click', downloadJson);
        saveContentBtn.addEventListener('click', saveContent);
        cancelEditBtn.addEventListener('click', () => contentModal.style.display = 'none');
        
        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) loginModal.style.display = 'none';
            if (e.target === contentModal) contentModal.style.display = 'none';
        });
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === editorCredentials.username && password === editorCredentials.password) {
            isAuthenticated = true;
            loginModal.style.display = 'none';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            editorPanel.style.display = 'block';
            renderCurrentPage(); // Re-renderizar para mostrar botones de edición
            
            // Limpiar formulario
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            alert('Credenciales incorrectas');
        }
    }

    function logout() {
        isAuthenticated = false;
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        editorPanel.style.display = 'none';
        
        // Recargar datos desde defaultData
        tempData = JSON.parse(JSON.stringify(defaultData));
        renderNavigation();
        renderCurrentPage();
    }

    function renderNavigation() {
        navList.innerHTML = '';
        
        tempData.pages.forEach(page => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = page.title;
            a.classList.toggle('active', page.id === tempData.currentPage);
            a.addEventListener('click', (e) => {
                e.preventDefault();
                tempData.currentPage = page.id;
                tempData.currentSubpage = null;
                renderNavigation();
                renderCurrentPage();
            });
            li.appendChild(a);
            navList.appendChild(li);
        });
    }

    function renderSubpageNavigation(page) {
        subpageNav.innerHTML = '';
        
        if (page.subpages && page.subpages.length > 0) {
            page.subpages.forEach(subpage => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = subpage.title;
                a.classList.toggle('active', subpage.id === tempData.currentSubpage);
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    tempData.currentSubpage = subpage.id;
                    renderCurrentPage();
                });
                subpageNav.appendChild(a);
            });
        }
    }

    function renderCurrentPage() {
        const currentPage = tempData.pages.find(page => page.id === tempData.currentPage);
        if (!currentPage) return;

        // Renderizar navegación de subpáginas
        renderSubpageNavigation(currentPage);

        // Determinar qué contenido mostrar
        let contentToShow = currentPage.content;
        let titleToShow = currentPage.title;

        if (tempData.currentSubpage) {
            const currentSubpage = currentPage.subpages.find(sub => sub.id === tempData.currentSubpage);
            if (currentSubpage) {
                contentToShow = currentSubpage.content;
                titleToShow = currentSubpage.title;
            }
        }

        // Actualizar título
        pageTitle.textContent = titleToShow;

        // Renderizar contenido
        pageContent.innerHTML = '';
        pageContent.className = 'page-content';

        if (contentToShow && contentToShow.length > 0) {
            contentToShow.forEach(item => {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'content-item';
                contentDiv.id = item.id;
                
                if (isAuthenticated) {
                    contentDiv.classList.add('editable');
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-btn';
                    editBtn.textContent = 'Editar';
                    editBtn.addEventListener('click', () => editContent(item));
                    contentDiv.appendChild(editBtn);
                }

                if (item.type === 'text') {
                    if (item.title) {
                        const titleEl = document.createElement('h3');
                        titleEl.textContent = item.title;
                        contentDiv.appendChild(titleEl);
                    }
                    
                    if (item.text) {
                        const textEl = document.createElement('p');
                        textEl.textContent = item.text;
                        contentDiv.appendChild(textEl);
                    }
                    
                    if (item.alignment) {
                        contentDiv.classList.add(`text-${item.alignment}`);
                    }
                } else if (item.type === 'embed') {
                    if (item.title) {
                        const titleEl = document.createElement('h3');
                        titleEl.textContent = item.title;
                        contentDiv.appendChild(titleEl);
                    }
                    
                    if (item.embedCode) {
                        const embedDiv = document.createElement('div');
                        embedDiv.innerHTML = item.embedCode;
                        contentDiv.appendChild(embedDiv);
                    }
                    
                    if (item.alignment) {
                        contentDiv.classList.add(`text-${item.alignment}`);
                    }
                }

                pageContent.appendChild(contentDiv);
            });
        } else {
            // Página vacía
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Esta página está vacía. ';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#666';
            
            if (isAuthenticated) {
                emptyMsg.innerHTML += '<br><br>';
                const addBtn = document.createElement('button');
                addBtn.textContent = 'Agregar Contenido';
                addBtn.className = 'btn btn-primary';
                addBtn.addEventListener('click', () => addNewContent());
                emptyMsg.appendChild(addBtn);
            }
            
            pageContent.appendChild(emptyMsg);
        }
    }

    function editContent(item) {
        currentEditingItem = item;
        currentEditingPage = tempData.currentPage;
        currentEditingSubpage = tempData.currentSubpage;
        
        // Llenar el formulario
        document.getElementById('content-title').value = item.title || '';
        document.getElementById('content-text').value = item.text || '';
        document.getElementById('content-alignment').value = item.alignment || 'left';
        document.getElementById('embed-code').value = item.embedCode || '';
        
        contentModal.style.display = 'block';
    }

    function addNewContent() {
        const newId = 'content-' + Date.now();
        const newItem = {
            id: newId,
            type: 'text',
            title: '',
            text: '',
            alignment: 'left'
        };
        
        // Agregar al contenido actual
        const currentPage = tempData.pages.find(page => page.id === tempData.currentPage);
        if (tempData.currentSubpage) {
            const currentSubpage = currentPage.subpages.find(sub => sub.id === tempData.currentSubpage);
            if (!currentSubpage.content) currentSubpage.content = [];
            currentSubpage.content.push(newItem);
        } else {
            if (!currentPage.content) currentPage.content = [];
            currentPage.content.push(newItem);
        }
        
        editContent(newItem);
    }

    function saveContent() {
        const title = document.getElementById('content-title').value;
        const text = document.getElementById('content-text').value;
        const alignment = document.getElementById('content-alignment').value;
        const embedCode = document.getElementById('embed-code').value.trim();
        
        if (!title && !text && !embedCode) {
            alert('Debe agregar al menos un título, texto o código embed');
            return;
        }
        
        // Determinar el tipo de contenido
        const contentType = embedCode ? 'embed' : 'text';
        
        // Actualizar el item
        currentEditingItem.type = contentType;
        currentEditingItem.title = title;
        currentEditingItem.text = text;
        currentEditingItem.alignment = alignment;
        
        if (contentType === 'embed') {
            currentEditingItem.embedCode = embedCode;
        }
        
        // Cerrar modal y re-renderizar
        contentModal.style.display = 'none';
        renderCurrentPage();
        
        // Limpiar variables
        currentEditingItem = null;
        currentEditingPage = null;
        currentEditingSubpage = null;
    }

    function addNewPage() {
        const title = prompt('Ingrese el título de la nueva página:');
        if (!title) return;
        
        const newId = 'page-' + Date.now();
        const newPage = {
            id: newId,
            title: title,
            content: [],
            subpages: []
        };
        
        tempData.pages.push(newPage);
        tempData.currentPage = newId;
        tempData.currentSubpage = null;
        
        renderNavigation();
        renderCurrentPage();
    }

    function addNewSubpage() {
        const title = prompt('Ingrese el título de la nueva subpágina:');
        if (!title) return;
        
        const currentPage = tempData.pages.find(page => page.id === tempData.currentPage);
        if (!currentPage) return;
        
        const newId = 'subpage-' + Date.now();
        const newSubpage = {
            id: newId,
            title: title,
            content: []
        };
        
        if (!currentPage.subpages) currentPage.subpages = [];
        currentPage.subpages.push(newSubpage);
        tempData.currentSubpage = newId;
        
        renderCurrentPage();
    }

    function saveChanges() {
        // Mostrar mensaje de confirmación
        const confirmMsg = `Los cambios se han guardado temporalmente. 
        
Para hacer los cambios permanentes:
1. Haz clic en "Descargar JSON"
2. Reemplaza el contenido del archivo data.js con los nuevos datos
3. Sube los cambios a GitHub
        
¿Deseas descargar el JSON ahora?`;
        
        if (confirm(confirmMsg)) {
            downloadJson();
        }
    }

    function downloadJson() {
        const dataStr = `// Codex Astralis - Datos actualizados
const defaultData = ${JSON.stringify(tempData, null, 2)};

// Credenciales de editor
const editorCredentials = {
    username: 'Editor',
    password: '06.23.08'
};

// Variable para almacenar datos temporales
let tempData = JSON.parse(JSON.stringify(defaultData));

// Variable para el estado de autenticación
let isAuthenticated = false;`;
        
        const blob = new Blob([dataStr], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Archivo data.js descargado. Reemplaza el archivo existente para hacer los cambios permanentes.');
    }

    // Función para eliminar contenido (bonus)
    function deleteContent(itemId) {
        if (!confirm('¿Está seguro de que desea eliminar este contenido?')) return;
        
        const currentPage = tempData.pages.find(page => page.id === tempData.currentPage);
        
        if (tempData.currentSubpage) {
            const currentSubpage = currentPage.subpages.find(sub => sub.id === tempData.currentSubpage);
            currentSubpage.content = currentSubpage.content.filter(item => item.id !== itemId);
        } else {
            currentPage.content = currentPage.content.filter(item => item.id !== itemId);
        }
        
        renderCurrentPage();
    }

    // Función para eliminar página (bonus)
    function deletePage(pageId) {
        if (!confirm('¿Está seguro de que desea eliminar esta página?')) return;
        
        tempData.pages = tempData.pages.filter(page => page.id !== pageId);
        
        if (tempData.currentPage === pageId) {
            tempData.currentPage = tempData.pages[0]?.id || 'main';
            tempData.currentSubpage = null;
        }
        
        renderNavigation();
        renderCurrentPage();
    }

    // Función para eliminar subpágina (bonus)
    function deleteSubpage(subpageId) {
        if (!confirm('¿Está seguro de que desea eliminar esta subpágina?')) return;
        
        const currentPage = tempData.pages.find(page => page.id === tempData.currentPage);
        currentPage.subpages = currentPage.subpages.filter(sub => sub.id !== subpageId);
        
        if (tempData.currentSubpage === subpageId) {
            tempData.currentSubpage = null;
        }
        
        renderCurrentPage();
    }

    // Agregar botones de eliminar al contenido cuando se está editando
    function addDeleteButtons() {
        if (!isAuthenticated) return;
        
        const contentItems = document.querySelectorAll('.content-item');
        contentItems.forEach(item => {
            if (!item.querySelector('.delete-btn')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 50px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 5px 8px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                deleteBtn.addEventListener('click', () => deleteContent(item.id));
                item.appendChild(deleteBtn);
                
                // Mostrar botón al hacer hover
                item.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
                item.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');
            }
        });
    }

    // Modificar renderCurrentPage para incluir botones de eliminar
    const originalRenderCurrentPage = renderCurrentPage;
    renderCurrentPage = function() {
        originalRenderCurrentPage();
        setTimeout(addDeleteButtons, 100);
    };

    // Atajos de teclado para editores
    document.addEventListener('keydown', (e) => {
        if (!isAuthenticated) return;
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
        
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            addNewContent();
        }
    });

    // Mejorar la experiencia de usuario
    document.addEventListener('beforeunload', (e) => {
        if (isAuthenticated && JSON.stringify(tempData) !== JSON.stringify(defaultData)) {
            e.preventDefault();
            e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        }
    });
});