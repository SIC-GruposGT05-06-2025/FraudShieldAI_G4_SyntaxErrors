# Guía de Integración para Windows

## Requisitos Previos

- Windows 10 o superior
- Python 3.11+ (https://www.python.org/downloads/)
- Node.js 18+ (https://nodejs.org/)
- pnpm (opcional, pero recomendado)
- Git (https://git-scm.com/)
- Docker Desktop (opcional, si quieres usar contenedores)

## Verificar Instalación

Abre PowerShell y ejecuta:

```powershell
python --version
node --version
npm --version
git --version
```

Deberías ver versiones para cada comando.

## Opción 1: Inicio Rápido (Recomendado para Windows)

### Paso 1: Ejecutar Script de Inicialización

En la raíz del proyecto (`FraudShieldAI`):

```powershell
.\init.bat
```

Esto automáticamente:
- Crea virtual environment
- Instala dependencias
- Configura archivos .env

### Paso 2: Iniciar Backend

Abre PowerShell y navega a `backend`:

```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Deberías ver:
```
Uvicorn running on http://127.0.0.1:8000
```

### Paso 3: Iniciar Frontend (Nueva Terminal)

Abre otra PowerShell y navega a `frontend`:

```powershell
cd frontend
pnpm dev
```

Deberías ver:
```
- Local: http://localhost:3000
```

### Paso 4: Abrir en Navegador

Abre http://localhost:3000 en tu navegador.

## Opción 2: Instalación Manual

Si prefieres hacerlo paso a paso:

### Backend

```powershell
# Navegar a backend
cd FraudShieldAI\backend

# Crear ambiente virtual
python -m venv venv

# Activar ambiente
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

En una nueva PowerShell:

```powershell
# Navegar a frontend
cd FraudShieldAI\frontend

# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

## Opción 3: Docker (Windows)

Si tienes Docker Desktop instalado:

```powershell
# Navegar a raíz del proyecto
cd FraudShieldAI

# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up
```

Abre http://localhost:3000

## Troubleshooting en Windows

### Problema: "python: The term 'python' is not recognized"

**Solución:**
1. Verifica que Python está instalado: `python --version`
2. Si no funciona, reinicia PowerShell
3. Si aún no funciona, agrega Python a PATH:
   - Settings → System → About → Advanced system settings
   - Environment variables → Path
   - Agrega: `C:\Users\TuUsuario\AppData\Local\Programs\Python\Python311`

### Problema: "venv\Scripts\activate" no funciona

**Solución:**
- Ejecuta PowerShell como administrador
- O usa: `python -m venv venv` directamente

### Problema: "pnpm: The term 'pnpm' is not recognized"

**Solución:**
```powershell
npm install -g pnpm
pnpm --version
```

### Problema: Puerto 3000 o 8000 en uso

**Solución - Backend (cambiar puerto):**
```powershell
uvicorn app.main:app --reload --port 8001
```

Luego en frontend, actualizar `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

**Solución - Frontend (cambiar puerto):**
```powershell
pnpm dev -p 3001
```

Luego en backend, actualizar `.env`:
```
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### Problema: "ModuleNotFoundError" en backend

**Solución:**
```powershell
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Problema: "Cannot find module" en frontend

**Solución:**
```powershell
cd frontend
rm -r node_modules pnpm-lock.yaml
pnpm install
```

## Verificar que Todo Funciona

### Verificar Backend

Abre navegador y ve a:
- http://localhost:8000/ - Estado de la API
- http://localhost:8000/health - Health check
- http://localhost:8000/docs - Documentación interactiva

### Verificar Frontend

Abre navegador y ve a:
- http://localhost:3000/ - Home
- http://localhost:3000/check - Checker de fraude
- http://localhost:3000/history - Historial
- http://localhost:3000/analytics - Analytics

### Hacer una Predicción

1. Ir a http://localhost:3000/check
2. Ingresar:
   - Amount: `100`
   - Location: `USA`
   - Device: `mobile`
3. Presionar "Analyze"
4. Ver resultado

## Desarrollo en Visual Studio Code

### Instalar Extensiones Recomendadas

1. **Python Extension Pack**
   - Identificador: `ms-python.python`
   - CMD: `code --install-extension ms-python.python`

2. **FastAPI**
   - Identificador: `codeium.codeium`
   - Instalar desde el marketplace

3. **ES7+ React/Redux/React-Native snippets**
   - Identificador: `dsznajder.es7-react-js-snippets`

4. **Prettier**
   - Identificador: `esbenp.prettier-vscode`

### Debugging Backend

1. Crear `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": ["app.main:app", "--reload"],
            "jinja": true,
            "cwd": "${workspaceFolder}/backend"
        }
    ]
}
```

2. Presionar F5 para iniciar con debugging

### Debugging Frontend

1. Instalar "Debugger for Chrome"
2. Crear `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Next.js: debug",
            "type": "node",
            "request": "launch",
            "cwd": "${workspaceFolder}/frontend",
            "args": ["--inspect-brk", "./node_modules/.bin/next", "dev"],
            "skipFiles": ["<node_internals>/**"],
            "console": "integratedTerminal"
        }
    ]
}
```

## Comandos Útiles para Windows

```powershell
# Matar proceso en puerto (ejemplo: puerto 8000)
Get-Process | Where-Object {$_.Port -eq 8000} | Stop-Process

# Ver procesos en puertos comunes
netstat -ano | findstr "3000"
netstat -ano | findstr "8000"

# Eliminar archivos de cache Python
rmdir /s /q backend\__pycache__
rmdir /s /q backend\app\__pycache__
rmdir /s /q backend\app\ml\__pycache__

# Eliminar node_modules
rmdir /s /q frontend\node_modules

# Ver variables de entorno
Get-ChildItem Env:
```

## Estructura de Directorios Esperada Después de Inicialización

```
FraudShieldAI/
├── .env (no existe, ok)
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── venv/
│   │   ├── Scripts/
│   │   └── Lib/
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── .env.local
│   ├── .env.local.example
│   ├── node_modules/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── *.md (guías)
```

## Logs y Debugging

### Ver logs del backend

Los logs aparecen en la terminal donde ejecutas:
```
uvicorn app.main:app --reload
```

Ejemplo:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     127.0.0.1 - "GET /api/v1/predict HTTP/1.1" 200
```

### Ver logs del frontend

Los logs aparecen en:
1. **Terminal**: Donde ejecutas `pnpm dev`
2. **Browser Console**: F12 → Console tab
3. **Network Tab**: F12 → Network tab para ver requests/responses

### Debugging de API Calls

En DevTools (F12):
1. Tab: Network
2. Busca requests a `/api/v1/`
3. Click en request
4. Ver Response para ver qué retorna el backend

## Pasos Finales

1. ✅ Backend corriendo en `http://localhost:8000`
2. ✅ Frontend corriendo en `http://localhost:3000`
3. ✅ Puedes hacer predicciones
4. ✅ Puedes ver historial
5. ✅ Puedes ver analytics

¡Listo para desarrollar! 🚀

## Recursos Adicionales

- Documentación FastAPI: https://fastapi.tiangolo.com/
- Documentación Next.js: https://nextjs.org/docs
- Documentación Python: https://docs.python.org/3/
- Documentación Node.js: https://nodejs.org/docs/

## Soporte

Si tienes problemas:
1. Leer `QUICK_START.md`
2. Leer `INTEGRATION_GUIDE.md`
3. Revisar `TROUBLESHOOTING` en documentación
4. Verificar que Python y Node están instalados
5. Verificar que los puertos 3000 y 8000 están libres

---

Última actualización: 10 de Diciembre, 2025
