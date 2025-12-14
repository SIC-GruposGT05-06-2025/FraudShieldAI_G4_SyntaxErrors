# FraudShieldAI - Backend y Frontend Integrados

Este proyecto integra un backend FastAPI con un frontend Next.js para detectar y prevenir fraude en transacciones.

## Estructura del Proyecto

```
FraudShieldAI/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── main.py      # Punto de entrada de la aplicación
│   │   ├── models.py    # Modelos de datos
│   │   ├── schemas.py   # Schemas de Pydantic
│   │   ├── ml/          # Módulo de ML con modelo de detección de fraude
│   │   └── routers/     # Endpoints de la API
│   ├── requirements.txt  # Dependencias de Python
│   ├── .env            # Variables de entorno
│   └── Dockerfile      # Configuración Docker
├── frontend/            # Aplicación Next.js
│   ├── app/            # Páginas y rutas
│   ├── components/     # Componentes React
│   ├── lib/            # Utilidades y cliente API
│   ├── package.json    # Dependencias de Node
│   ├── .env.local      # Variables de entorno
│   └── Dockerfile      # Configuración Docker
└── docker-compose.yml  # Orquestación de servicios
```

## Configuración Rápida

### Requisitos Previos

- **Docker y Docker Compose** (recomendado)
- O bien:
  - Python 3.11+
  - Node.js 18+
  - pnpm o npm

### Opción 1: Con Docker (Recomendado)

```bash
# Ir a la raíz del proyecto
cd FraudShieldAI

# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Opción 2: Ejecutar Localmente

#### Backend (Terminal 1)

```bash
cd backend

# Crear un entorno virtual
python -m venv venv

# Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env (si no existe)
cp .env.example .env

# Ejecutar el servidor
uvicorn app.main:app --reload --port 8000
```

El backend estará disponible en: http://localhost:8000

#### Frontend (Terminal 2)

```bash
cd frontend

# Instalar dependencias
pnpm install
# o npm install

# Crear archivo .env.local (si no existe)
cp .env.local.example .env.local

# Ejecutar en desarrollo
pnpm dev
# o npm run dev
```

El frontend estará disponible en: http://localhost:3000

## Variables de Entorno

### Backend (.env)

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DEBUG=True
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Endpoints Principales

### API Base: `http://localhost:8000/api/v1`

#### Predicción de Fraude
- **POST** `/predict` - Predecir si una transacción es fraudulenta
  ```json
  {
    "amount": 100.50,
    "location": "USA",
    "device": "mobile"
  }
  ```

- **POST** `/predict/full` - Predicción con conjunto completo de features

#### Transacciones
- **GET** `/transactions` - Obtener lista de transacciones
  - Query parameters: `page`, `limit`, `risk_level`, `is_fraud`

- **POST** `/transactions` - Crear nueva transacción
- **GET** `/transactions/{transaction_id}` - Obtener transacción específica

#### Utilidades
- **GET** `/` - Estado de la API
- **GET** `/health` - Verificar salud del servicio

## Características Implementadas

✅ **CORS Habilitado** - El backend acepta solicitudes desde el frontend  
✅ **Versionado de API** - Endpoints bajo `/api/v1`  
✅ **Validación de Datos** - Schemas de Pydantic para entrada/salida  
✅ **Detección de Fraude** - Modelo ML integrado  
✅ **API Completa** - Endpoints para predicciones y transacciones  
✅ **Docker Support** - Ambos servicios pueden correr en contenedores  
✅ **Frontend Conectado** - Cliente API TypeScript en el frontend  
✅ **Error Handling** - Fallback a datos mock en caso de error  

## Desarrollo

### Agregar Nueva Funcionalidad al Backend

1. Crear el router en `backend/app/routers/`
2. Agregar los schemas en `backend/app/schemas.py` si es necesario
3. Incluir el router en `backend/app/main.py`
4. Actualizar el cliente API en `frontend/lib/api.ts`

### Agregar Nueva Funcionalidad al Frontend

1. Crear componentes en `frontend/components/`
2. Crear página en `frontend/app/` si es nueva sección
3. Usar funciones de `frontend/lib/api.ts` para llamadas al backend
4. Actualizar tipos en `frontend/lib/types.ts`

## Troubleshooting

### El frontend no puede conectar al backend

1. Verificar que el backend está corriendo en `http://localhost:8000`
2. Verificar que la variable `NEXT_PUBLIC_API_URL` está configurada correctamente
3. Revisar la consola del navegador para errores CORS
4. Reiniciar ambos servicios

### Errores de CORS

El backend está configurado para aceptar solicitudes desde:
- `http://localhost:3000` (Next.js dev)
- `http://localhost:3001` (Puerto alternativo)

Para agregar más orígenes, editar la variable `ALLOWED_ORIGINS` en `.env` del backend.

### Base de datos vacía

La aplicación actualmente usa bases de datos en memoria. Para datos persistentes, reemplazar las listas de Python con una base de datos real (PostgreSQL, MongoDB, etc.).

## Próximos Pasos

- [ ] Implementar base de datos persistente (PostgreSQL/MongoDB)
- [ ] Agregar autenticación y autorización
- [ ] Crear panel de analytics más detallado
- [ ] Integrar notificaciones en tiempo real (WebSockets)
- [ ] Mejorar el modelo de ML con más features
- [ ] Agregar pruebas unitarias e integración
- [ ] Configurar CI/CD (GitHub Actions)

## Licencia

MIT

## Soporte

Para problemas o preguntas, crear un issue en el repositorio.
