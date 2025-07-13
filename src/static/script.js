// Global state
let currentUser = null;
let currentSection = 'courses';
let currentAdminSection = 'users';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Admin forms
    document.getElementById('addCourseForm').addEventListener('submit', handleAddCourse);
    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
}

// API Helper functions
async function apiCall(endpoint, method = 'GET', data = null) {
    showLoading(true);
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error en la solicitud');
        }
        
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        showLoading(false);
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const result = await apiCall('/api/auth/login', 'POST', { email, password });
        currentUser = result.user;
        showToast('Inicio de sesión exitoso', 'success');
        
        if (currentUser.is_admin) {
            showAdminDashboard();
        } else {
            showUserDashboard();
        }
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const registration_code = document.getElementById('registerCode').value;
    
    try {
        await apiCall('/api/auth/register', 'POST', { 
            name, 
            email, 
            password, 
            registration_code 
        });
        showToast('Usuario registrado exitosamente', 'success');
        showLogin();
        document.getElementById('registerForm').reset();
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function logout() {
    try {
        await apiCall('/api/auth/logout', 'POST');
        currentUser = null;
        showToast('Sesión cerrada exitosamente', 'success');
        showLogin();
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function checkSession() {
    try {
        const result = await apiCall('/api/auth/check-session');
        if (result.logged_in) {
            currentUser = result.user;
            if (currentUser.is_admin) {
                showAdminDashboard();
            } else {
                showUserDashboard();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
}

// Page navigation
function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').classList.add('active');
}

function showRegister() {
    hideAllPages();
    document.getElementById('registerPage').classList.add('active');
}

function showUserDashboard() {
    hideAllPages();
    document.getElementById('userDashboard').classList.add('active');
    document.getElementById('userName').textContent = `Bienvenido, ${currentUser.name}`;
    loadCourses();
    loadBooks();
}

function showAdminDashboard() {
    hideAllPages();
    document.getElementById('adminDashboard').classList.add('active');
    loadUsers();
    loadAdminCourses();
    loadAdminBooks();
    loadCodes();
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Section navigation
function showSection(section) {
    currentSection = section;
    
    // Update nav buttons
    document.querySelectorAll('#userDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show section
    document.querySelectorAll('#userDashboard .content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(section + 'Section').classList.add('active');
}

function showAdminSection(section) {
    currentAdminSection = section;
    
    // Update nav buttons
    document.querySelectorAll('#adminDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show section
    document.querySelectorAll('#adminDashboard .content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById('admin' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section').classList.add('active');
}

// Data loading functions
async function loadCourses() {
    try {
        const courses = await apiCall('/api/courses/');
        displayCourses(courses);
    } catch (error) {
        document.getElementById('coursesList').innerHTML = getEmptyState('No hay cursos disponibles');
    }
}

async function loadBooks() {
    try {
        const books = await apiCall('/api/books/');
        displayBooks(books);
    } catch (error) {
        document.getElementById('booksList').innerHTML = getEmptyState('No hay libros disponibles');
    }
}

async function loadUsers() {
    try {
        const users = await apiCall('/api/admin/users');
        displayUsers(users);
    } catch (error) {
        document.getElementById('usersList').innerHTML = getEmptyState('No hay usuarios registrados');
    }
}

async function loadAdminCourses() {
    try {
        const courses = await apiCall('/api/courses/');
        displayAdminCourses(courses);
    } catch (error) {
        document.getElementById('adminCoursesList').innerHTML = getEmptyState('No hay cursos disponibles');
    }
}

async function loadAdminBooks() {
    try {
        const books = await apiCall('/api/books/');
        displayAdminBooks(books);
    } catch (error) {
        document.getElementById('adminBooksList').innerHTML = getEmptyState('No hay libros disponibles');
    }
}

async function loadCodes() {
    try {
        const codes = await apiCall('/api/admin/codes');
        displayCodes(codes);
    } catch (error) {
        document.getElementById('codesList').innerHTML = getEmptyState('No hay códigos generados');
    }
}

// Display functions
function displayCourses(courses) {
    const container = document.getElementById('coursesList');
    
    if (courses.length === 0) {
        container.innerHTML = getEmptyState('No hay cursos disponibles');
        return;
    }
    
    container.innerHTML = courses.map(course => `
        <div class="item-card" onclick="window.open('${course.link}', '_blank')">
            <div class="item-badge">Curso</div>
            <h3>${course.name}</h3>
            <a href="${course.link}" target="_blank" class="item-link" onclick="event.stopPropagation()">
                <i class="fas fa-external-link-alt"></i>
                Acceder al curso
            </a>
        </div>
    `).join('');
}

function displayBooks(books) {
    const container = document.getElementById('booksList');
    
    if (books.length === 0) {
        container.innerHTML = getEmptyState('No hay libros disponibles');
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="item-card" onclick="window.open('${book.link}', '_blank')">
            <div class="item-badge">Libro</div>
            <h3>${book.name}</h3>
            <a href="${book.link}" target="_blank" class="item-link" onclick="event.stopPropagation()">
                <i class="fas fa-external-link-alt"></i>
                Acceder al libro
            </a>
        </div>
    `).join('');
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    if (users.length === 0) {
        container.innerHTML = getEmptyState('No hay usuarios registrados');
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info-card">
                <div class="user-avatar">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                    <p>Clave: ${user.registration_code}</p>
                </div>
            </div>
            <div>
                ${user.is_admin ? '<span class="user-badge">Admin</span>' : ''}
                ${!user.is_admin ? `<button class="btn-delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </div>
        </div>
    `).join('');
}

function displayAdminCourses(courses) {
    const container = document.getElementById('adminCoursesList');
    
    if (courses.length === 0) {
        container.innerHTML = getEmptyState('No hay cursos disponibles');
        return;
    }
    
    container.innerHTML = courses.map(course => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h4>${course.name}</h4>
                <p>${course.link}</p>
            </div>
            <button class="btn-delete" onclick="deleteCourse(${course.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function displayAdminBooks(books) {
    const container = document.getElementById('adminBooksList');
    
    if (books.length === 0) {
        container.innerHTML = getEmptyState('No hay libros disponibles');
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h4>${book.name}</h4>
                <p>${book.link}</p>
            </div>
            <button class="btn-delete" onclick="deleteBook(${book.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function displayCodes(codes) {
    const container = document.getElementById('codesList');
    
    if (codes.length === 0) {
        container.innerHTML = getEmptyState('No hay códigos generados');
        return;
    }
    
    container.innerHTML = codes.map(code => `
        <div class="code-card">
            <div class="code-value">${code.code}</div>
            <div class="code-status ${code.is_used ? 'used' : 'unused'}">
                ${code.is_used ? 'Usada' : 'Disponible'}
            </div>
        </div>
    `).join('');
}

// Admin functions
async function handleAddCourse(e) {
    e.preventDefault();
    
    const name = document.getElementById('courseName').value;
    const link = document.getElementById('courseLink').value;
    const image_url = document.getElementById('courseImage').value;
    
    try {
        await apiCall('/api/courses/', 'POST', { name, link, image_url });
        showToast('Curso añadido exitosamente', 'success');
        document.getElementById('addCourseForm').reset();
        loadAdminCourses();
        loadCourses(); // Refresh user view if needed
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function handleAddBook(e) {
    e.preventDefault();
    
    const name = document.getElementById('bookName').value;
    const link = document.getElementById('bookLink').value;
    const image_url = document.getElementById('bookImage').value;
    
    try {
        await apiCall('/api/books/', 'POST', { name, link, image_url });
        showToast('Libro añadido exitosamente', 'success');
        document.getElementById('addBookForm').reset();
        loadAdminBooks();
        loadBooks(); // Refresh user view if needed
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function deleteCourse(courseId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) {
        return;
    }
    
    try {
        await apiCall(`/api/courses/${courseId}`, 'DELETE');
        showToast('Curso eliminado exitosamente', 'success');
        loadAdminCourses();
        loadCourses(); // Refresh user view if needed
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function deleteBook(bookId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        return;
    }
    
    try {
        await apiCall(`/api/books/${bookId}`, 'DELETE');
        showToast('Libro eliminado exitosamente', 'success');
        loadAdminBooks();
        loadBooks(); // Refresh user view if needed
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return;
    }
    
    try {
        await apiCall(`/api/admin/users/${userId}`, 'DELETE');
        showToast('Usuario eliminado exitosamente', 'success');
        loadUsers();
    } catch (error) {
        // Error already handled in apiCall
    }
}

async function generateCode() {
    try {
        const result = await apiCall('/api/admin/generate-code', 'POST');
        showToast(`Código generado: ${result.code}`, 'success');
        loadCodes();
    } catch (error) {
        // Error already handled in apiCall
    }
}

// Utility functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getEmptyState(message) {
    return `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>Sin contenido</h3>
            <p>${message}</p>
        </div>
    `;
}

