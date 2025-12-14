# Integración Backend-Frontend

## Resumen de la Integración

El backend FastAPI está completamente integrado con el frontend Next.js para proporcionar una experiencia de usuario fluida con predicción de fraude en tiempo real.

## Cambios Realizados

### Backend (FastAPI)

#### 1. **CORS Habilitado**
- Archivo: `backend/app/main.py`
- Se agregó middleware de CORS para permitir solicitudes desde el frontend
- Soporta múltiples orígenes configurables vía variable de entorno `ALLOWED_ORIGINS`

#### 2. **Endpoints Versionados**
- Todos los endpoints están bajo `/api/v1` para facilitar versionado futuro
- Estructura:
  - `POST /api/v1/predict` - Predicción simple de fraude
  - `POST /api/v1/predict/full` - Predicción con features completos
  - `GET /api/v1/transactions` - Obtener transacciones con paginación y filtros
  - `POST /api/v1/transactions` - Crear nueva transacción
  - `GET /api/v1/transactions/{id}` - Obtener transacción específica

#### 3. **Respuestas Mejoradas**
- **Router de Predicción** (`backend/app/routers/predict.py`):
  - Ahora retorna respuestas completas con campos que el frontend espera:
    - `transaction_id`: ID único de la transacción
    - `is_fraud`: Boolean indicando si es fraude
    - `fraud_probability`: Probabilidad de fraude (0-1)
    - `risk_score`: Score de riesgo (0-100)
    - `risk_level`: Nivel de riesgo (LOW, MEDIUM, HIGH, CRITICAL)
    - `confidence`: Nivel de confianza de la predicción
    - `factors`: Factores que contribuyeron a la decisión
    - `timestamp`: Timestamp ISO de la predicción

- **Router de Transacciones** (`backend/app/routers/transactions.py`):
  - Implementó paginación
  - Agregó filtros por `risk_level` e `is_fraud`
  - Retorna formato consistente con el frontend

#### 4. **Health Check**
- Endpoint `GET /` para estado general
- Endpoint `GET /health` para verificar salud del servicio

### Frontend (Next.js)

#### 1. **Cliente API Configurado**
- Archivo: `frontend/lib/api.ts`
- URL Base: `http://localhost:8000/api/v1`
- Soporta fallback a datos mock si el backend no está disponible

#### 2. **Funciones de API Disponibles**
```typescript
// Predicción de transacciones
export async function predictTransaction(data: PredictionRequest): Promise<PredictionResponse>

// Obtener transacciones
export async function getTransactions(page?: number, limit?: number, filters?: any)

// Analytics
export async function getAnalyticsSummary(): Promise<AnalyticsSummary>
export async function getTrends(): Promise<TrendData[]>
export async function getRiskDistribution(): Promise<RiskDistribution[]>
export async function getModelInfo(): Promise<ModelInfo>
```

#### 3. **Variables de Entorno**
- Archivo: `frontend/.env.local`
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`

### Configuración

#### Backend (.env)
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DEBUG=True
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Flujo de Datos

### Ejemplo: Predicción de Fraude

```
Frontend (Next.js)
    ↓
1. Usuario ingresa datos en el formulario
    ↓
2. Componente captura los datos (TransactionForm)
    ↓
3. Llama a predictTransaction() desde lib/api.ts
    ↓
Backend (FastAPI)
    ↓
4. Recibe POST /api/v1/predict
    ↓
5. Router predict.py valida datos con Pydantic
    ↓
6. FraudDetector realiza predicción
    ↓
7. Retorna respuesta con estructura completa
    ↓
Frontend
    ↓
8. Recibe respuesta JSON
    ↓
9. Renderiza ResultCard con los resultados
    ↓
10. Usuario ve el análisis de riesgo
```

## Componentes que Usan la API

### Frontend Components
- **CheckerForm** (`components/checker/transaction-form.tsx`)
  - Captura input del usuario
  - Llama a `predictTransaction()`

- **ResultCard** (`components/checker/result-card.tsx`)
  - Muestra resultado de predicción
  - Usa datos de `PredictionResponse`

- **TransactionsTable** (`components/history/transactions-table.tsx`)
  - Muestra historial de transacciones
  - Llama a `getTransactions()`

- **AnalyticsComponents** (`components/analytics/`)
  - Muestran estadísticas del modelo
  - Usan `getAnalyticsSummary()`, `getTrends()`, etc.

### Backend Routers
- **predict.py**: Lógica de predicción
- **transactions.py**: Gestión de transacciones

## Características de Resiliencia

### Fallback a Datos Mock
Si el backend no está disponible, el frontend automáticamente retorna datos simulados:
```typescript
try {
    // Intentar conectar al backend
    const response = await fetch(`${API_BASE_URL}/predict`, { ... })
    return await response.json()
} catch (error) {
    // Si falla, retornar datos mock
    return generateMockResponse()
}
```

Esto permite:
- Desarrollo sin backend en tiempo de compilación
- Testing del UI sin necesidad del servidor
- Mejor experiencia de usuario ante fallos

## Seguridad

### CORS
- Configurado para aceptar solicitudes específicas
- Controlado por variable de entorno
- Fácil de actualizar para producción

### Validación de Datos
- Pydantic schemas en el backend validan entrada
- TypeScript types en el frontend validan interfaz

### Logs
- El backend registra predicciones
- Facilita auditoría y debugging

## Deployment

### Docker
Se proporcionan Dockerfiles para ambos servicios:
- `backend/Dockerfile`: Python + FastAPI
- `frontend/Dockerfile`: Node.js + Next.js

### Docker Compose
```bash
docker-compose up
```

Inicia ambos servicios orquestados:
- Frontend: puerto 3000
- Backend: puerto 8000
- Redes compartidas para comunicación interna

## Próximos Pasos de Integración

1. **Base de Datos Persistente**
   - Reemplazar listas en memoria con PostgreSQL/MongoDB
   - Almacenar historial de transacciones

2. **Autenticación**
   - JWT en backend
   - Auth0 o similar en frontend

3. **WebSockets**
   - Alertas en tiempo real para fraudes detectados
   - Dashboard actualización automática

4. **Logging y Monitoring**
   - ELK Stack para logging centralizado
   - Prometheus para métricas

5. **CI/CD**
   - GitHub Actions para testing automático
   - Deploy automático a producción

## Troubleshooting

### Error: "Can't connect to backend"
1. Verificar que el backend está corriendo en puerto 8000
2. Verificar CORS en .env del backend
3. Verificar URL en .env.local del frontend

### Error: CORS "Access-Control-Allow-Origin"
1. El origen de tu frontend debe estar en `ALLOWED_ORIGINS`
2. Ejemplo: Si frontend es `http://mi-dominio.com:3000`, agregar a:
   ```env
   ALLOWED_ORIGINS=http://mi-dominio.com:3000,http://localhost:3000
   ```

### Los datos son siempre mock
1. Verificar que el backend está corriendo
2. Abrir DevTools → Network → ver respuesta de /api/v1/predict
3. Si retorna error, leer el mensaje
