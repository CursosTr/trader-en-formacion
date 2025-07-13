# Trader en Formación

Una aplicación web completa para gestionar cursos y libros de trading con sistema de autenticación y panel de administración.

## Características

- **Sistema de autenticación**: Login y registro de usuarios con códigos de acceso
- **Panel de administración**: Gestión completa de usuarios, cursos, libros y códigos de registro
- **Panel de usuario**: Acceso a cursos y libros disponibles
- **Base de datos**: SQLite para almacenar toda la información
- **Diseño responsivo**: Compatible con dispositivos móviles y de escritorio
- **Interfaz moderna**: Diseño atractivo con gradientes y animaciones

## Estructura del Proyecto

```
trader-en-formacion/
├── src/
│   ├── models/
│   │   └── user.py          # Modelos de base de datos
│   ├── routes/
│   │   ├── auth.py          # Rutas de autenticación
│   │   ├── admin.py         # Rutas de administración
│   │   ├── courses.py       # Rutas de cursos
│   │   └── books.py         # Rutas de libros
│   ├── static/
│   │   ├── index.html       # Interfaz principal
│   │   ├── styles.css       # Estilos CSS
│   │   └── script.js        # Lógica JavaScript
│   ├── database/
│   │   └── app.db           # Base de datos SQLite
│   └── main.py              # Archivo principal de Flask
├── venv/                    # Entorno virtual
├── requirements.txt         # Dependencias
└── README.md               # Este archivo
```

## Instalación y Configuración

### Requisitos Previos
- Python 3.11 o superior
- pip (gestor de paquetes de Python)

### Pasos de Instalación

1. **Navegar al directorio del proyecto**:
   ```bash
   cd trader-en-formacion
   ```

2. **Activar el entorno virtual**:
   ```bash
   source venv/bin/activate
   ```

3. **Instalar dependencias** (ya están instaladas):
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecutar la aplicación**:
   ```bash
   python src/main.py
   ```

5. **Acceder a la aplicación**:
   Abrir el navegador y visitar: `http://localhost:5000`

## Uso de la Aplicación

### Credenciales de Administrador
- **Email**: admin@trader.com
- **Contraseña**: admin123_

### Funcionalidades del Administrador

1. **Gestión de Usuarios**:
   - Ver todos los usuarios registrados
   - Eliminar usuarios (excepto administradores)
   - Ver información de códigos de registro utilizados

2. **Gestión de Cursos**:
   - Añadir nuevos cursos con nombre, enlace e imagen opcional
   - Eliminar cursos existentes
   - Ver lista de todos los cursos

3. **Gestión de Libros**:
   - Añadir nuevos libros con nombre, enlace e imagen opcional
   - Eliminar libros existentes
   - Ver lista de todos los libros

4. **Generador de Códigos**:
   - Generar códigos únicos de registro
   - Ver estado de códigos (usados/disponibles)
   - Los códigos son necesarios para que nuevos usuarios se registren

### Funcionalidades del Usuario

1. **Registro**:
   - Crear cuenta con nombre, email, contraseña y código de registro
   - El código debe ser proporcionado por el administrador

2. **Acceso a Contenido**:
   - Ver cursos disponibles
   - Ver libros disponibles
   - Acceder directamente a los enlaces de cursos y libros

## Estructura de la Base de Datos

### Tabla Users
- `id`: Identificador único
- `name`: Nombre completo del usuario
- `email`: Email único del usuario
- `password_hash`: Contraseña encriptada
- `registration_code`: Código usado para registrarse
- `is_admin`: Indica si es administrador

### Tabla Courses
- `id`: Identificador único
- `name`: Nombre del curso
- `link`: Enlace al curso
- `image_url`: URL de imagen opcional

### Tabla Books
- `id`: Identificador único
- `name`: Nombre del libro
- `link`: Enlace al libro
- `image_url`: URL de imagen opcional

### Tabla RegistrationCodes
- `id`: Identificador único
- `code`: Código de registro único
- `is_used`: Estado del código
- `created_by_admin`: ID del administrador que lo creó

## Tecnologías Utilizadas

### Backend
- **Flask**: Framework web de Python
- **SQLAlchemy**: ORM para base de datos
- **SQLite**: Base de datos
- **bcrypt**: Encriptación de contraseñas
- **Flask-CORS**: Manejo de CORS

### Frontend
- **HTML5**: Estructura de la página
- **CSS3**: Estilos y diseño responsivo
- **JavaScript**: Interactividad y comunicación con API
- **Font Awesome**: Iconos

## Seguridad

- Contraseñas encriptadas con bcrypt
- Sesiones seguras con Flask
- Validación de permisos en todas las rutas
- Códigos de registro únicos para controlar acceso

## Personalización

### Cambiar Colores
Editar las variables CSS en `src/static/styles.css`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Añadir Nuevas Funcionalidades
1. Crear nuevas rutas en `src/routes/`
2. Añadir modelos en `src/models/user.py`
3. Actualizar la interfaz en `src/static/`

## Solución de Problemas

### Error de Base de Datos
Si hay problemas con la base de datos, eliminar el archivo:
```bash
rm src/database/app.db
```
La base de datos se recreará automáticamente al iniciar la aplicación.

### Puerto en Uso
Si el puerto 5000 está ocupado, cambiar en `src/main.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

## Licencia

Este proyecto es de uso libre para fines educativos y comerciales.

## Soporte

Para soporte técnico o consultas, contactar al desarrollador.

