# FraudShieldAI - Quick Start Guide

## Inicio Rápido (5 minutos)

### Opción 1: Docker (Recomendado)

```bash
# En la raíz del proyecto
docker-compose up

# El sistema estará listo en:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Opción 2: Windows (Local)

**Terminal 1 - Backend:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
pnpm install
pnpm dev
```

Abre http://localhost:3000

### Opción 3: macOS/Linux (Local)

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

Abre http://localhost:3000

## Estructura de Carpetas

```
FraudShieldAI/
├── backend/
│   ├── app/
│   │   ├── main.py              ← API principal
│   │   ├── schemas.py           ← Validación de datos
│   │   ├── models.py            ← Modelos
│   │   ├── ml/
│   │   │   └── fraud_detector.py ← Modelo ML
│   │   └── routers/
│   │       ├── predict.py       ← Endpoint de predicción
│   │       └── transactions.py  ← Endpoint de transacciones
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
│
├── frontend/
│   ├── app/                     ← Páginas
│   │   ├── page.tsx            ← Home
│   │   ├── check/page.tsx       ← Checker
│   │   ├── history/page.tsx     ← Historial
│   │   └── analytics/page.tsx   ← Analytics
│   ├── components/
│   │   ├── checker/
│   │   │   └── transaction-form.tsx ← Formulario
│   │   ├── history/
│   │   │   └── transactions-table.tsx ← Tabla
│   │   └── analytics/           ← Gráficos
│   ├── lib/
│   │   ├── api.ts              ← Cliente API ⭐
│   │   └── types.ts            ← Tipos
│   ├── package.json
│   ├── .env.local
│   └── Dockerfile
│
├── docker-compose.yml           ← Orquestación
├── INTEGRATION_GUIDE.md          ← Guía completa
└── BACKEND_FRONTEND_INTEGRATION.md
```

## API Endpoints

### Predicción
- `POST /api/v1/predict` - Predecir fraude
  ```bash
  curl -X POST http://localhost:8000/api/v1/predict \
    -H "Content-Type: application/json" \
    -d '{"amount": 100, "location": "USA", "device": "mobile"}'
  ```

### Transacciones
- `GET /api/v1/transactions?page=1&limit=20` - Listar
- `POST /api/v1/transactions` - Crear
- `GET /api/v1/transactions/{id}` - Ver una

### Utilidades
- `GET /` - Estado
- `GET /health` - Salud del servicio
- `GET /docs` - Documentación interactiva (Swagger)

## Cómo Usar la Aplicación

### 1. Verificar Transacción
1. Ir a http://localhost:3000/check
2. Ingresar monto, ubicación y dispositivo
3. Enviar
4. Ver resultado de riesgo

### 2. Ver Historial
1. Ir a http://localhost:3000/history
2. Ver transacciones analizadas
3. Filtrar por nivel de riesgo o estado

### 3. Ver Analytics
1. Ir a http://localhost:3000/analytics
2. Ver métricas del modelo
3. Ver tendencias de fraude

## Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `frontend/lib/api.ts` | Cliente API - actualizar URLs aquí |
| `backend/app/main.py` | Configuración CORS - cambiar orígenes aquí |
| `frontend/.env.local` | URL del API - configurable |
| `backend/.env` | Variables de entorno del backend |
| `docker-compose.yml` | Orquestación de contenedores |

## Desarrollo

### Agregar endpoint en backend
1. Crear función en `routers/`
2. Incluir router en `main.py`
3. El frontend usa `lib/api.ts` para llamarlo

### Agregar función en frontend
1. Crear en `lib/api.ts`
2. Agregar tipos en `lib/types.ts`
3. Usar en componentes

## Debugging

### Backend no responde
```bash
# Verificar que está corriendo
curl http://localhost:8000/health

# Ver logs
# Terminal donde corre uvicorn
```

### Frontend no conecta
1. Abrir DevTools (F12)
2. Tab Network
3. Buscar request a `/api/v1/`
4. Verificar status code y response

### CORS error
1. Verificar `ALLOWED_ORIGINS` en `.env` del backend
2. Debe incluir `http://localhost:3000`
3. Reiniciar backend

## Notas Importantes

⚠️ **En Desarrollo**: Los datos se guardan en memoria (se pierden al reiniciar)

✅ **Próximamente**: Integración con base de datos persistente

📚 **Documentación API**: http://localhost:8000/docs (Swagger UI)

## Problemas Comunes

**Puerto 3000 en uso:**
```bash
# Usar puerto alternativo
cd frontend
pnpm dev -p 3001
# Luego actualizar ALLOWED_ORIGINS en backend
```

**Port 8000 en uso:**
```bash
# Usar puerto alternativo
cd backend
uvicorn app.main:app --port 8001
# Luego actualizar NEXT_PUBLIC_API_URL en frontend
```

**Module not found:**
```bash
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Siguientes Pasos

1. ✅ Integración backend-frontend completada
2. ⏭️ Base de datos persistente (PostgreSQL)
3. ⏭️ Autenticación de usuarios
4. ⏭️ Notificaciones en tiempo real
5. ⏭️ Deploy a producción

¡Listo para desarrollar! 🚀
