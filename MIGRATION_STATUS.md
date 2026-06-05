# Migración de Attio a Supabase - Estado del Proyecto

## ✅ Completado

### 1. Cliente Supabase (`lib/supabase.ts`)
- Creado cliente Supabase con credenciales
- Implementadas funciones `fetchAllDeals()` y `fetchAllMeetingEntries()`
- Sistema de caché con TTL de 5 minutos
- Mapeo de nombres de stages de Supabase a nombres esperados por business logic
- JOIN con tabla `deal_stages` para obtener nombres de stages

### 2. Updates en API Routes
Actualizados todos los imports de Attio a Supabase en:
- ✅ `app/api/executive/[quarter]/route.ts`
- ✅ `app/api/ae/[quarter]/route.ts`
- ✅ `app/api/sdr/[quarter]/route.ts`
- ✅ `app/api/pipeline-review/[quarter]/route.ts`
- ✅ `app/api/cache/route.ts`
- ✅ `app/api/cache/clear/route.ts`
- ✅ `app/api/quarters/route.ts`

### 3. Updates en Business Logic
- ✅ `lib/business-logic.ts`: Cambió import de attio a supabase

### 4. Dependencias
- ✅ `package.json`: Agregada `@supabase/supabase-js`

## 🔄 Próximos Pasos

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Validación de estructura de datos
Es necesario verificar:
- [ ] Sintaxis exacta del JOIN en Supabase (confirmar que `deal_stages(id, name)` es correcto)
- [ ] Mapeo correcto de campos: `stage_id` → nombre del stage via JOIN
- [ ] Campos opcionales en deals que puedan ser NULL
- [ ] Estructura exacta de retorno del JOIN (¿array o objeto?)

### 3. Pruebas
```bash
npm run dev
# Visitar http://localhost:3000 para pruebas
# Verificar endpoint: http://localhost:3000/api/executive/Q1%202026
```

### 4. Mapeo adicional (si es necesario)
Si los stage names en Supabase no coinciden exactamente con los de business-logic, actualizar `STAGE_NAME_MAP` en `lib/supabase.ts`

## 📊 Estructura de Datos

### Tabla `deals` (589 rows)
- id (UUID)
- name (string)
- company_id (UUID)
- company_name (string)
- stage_id (UUID - referencia a deal_stages)
- account_executive (string)
- sdr (string)
- value (numeric)
- currency (string)
- event (string)
- created_at (timestamp)
- updated_at (timestamp)
- [otros campos...]

### Tabla `deal_stages` (8 rows)
- id (UUID)
- name (string)
- order (numeric)

Stages existentes:
- Discovery realizada
- Propuesta en construcción
- Propuesta presentada
- Committed
- Cierre ganado

## ⚠️ Notas Importantes

1. **Meeting Entries**: Actualmente devuelven array vacío. Si hay tabla de meeting entries, implementar similar a deals.

2. **Credenciales**: Las credenciales de Supabase están hardcoded en `lib/supabase.ts`. Considerar mover a `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://yiymlemmsqdklavwgdgt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

3. **Stage Name Mapping**: El mapeo actual asume estos nombres en Supabase. Ajustar según sea necesario.

4. **Cálculos**: Todos los cálculos en business-logic.ts ahora se hacen sobre datos de Supabase en lugar de Attio. Validar que los KPIs se calculen correctamente.
