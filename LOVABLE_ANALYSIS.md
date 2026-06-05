# Análisis Completo de Lovable - Actualización del Dashboard

## 📊 Estructura Completa de la Tabla `deals`

### Campos Core (Identificación y Producto)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del deal |
| `name` | TEXT | Nombre del deal |
| `company_id` | UUID | ID de la empresa asociada |
| `company_name` | TEXT | Nombre de la empresa |
| `stage_id` | UUID | FK a deal_stages (etapa actual) |
| `event` | TEXT | Evento asociado (AI Summit, CTW, etc.) |

### Campos de Personas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `account_executive` | TEXT | AE responsable del deal |
| `sdr` | TEXT | SDR que originó el deal |
| `secondary_ae` | TEXT | AE secundario |

### Campos Financieros
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `value` | NUMERIC | Monto del deal en USD |
| `currency` | TEXT | Moneda (default USD) |
| `expected_close_date` | DATE | Fecha esperada de cierre |
| `billing_date` | DATE | Fecha de facturación |
| `collection_date` | DATE | Fecha de cobranza |

### Campos de Contexto
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `notes` | TEXT | Notas adicionales |
| `meeting_id` | UUID | ID de meeting asociada |
| `lost_reason` | TEXT | Razón si se perdió el deal |
| `checklist` | ARRAY/JSON | Checklist de tareas |

### Campos de Eco-sistema (Colombia Tech)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `paquete_vendido` | TEXT/BOOLEAN | Paquete vendido |
| `adicionales_para` | TEXT | Adicionales para... |
| `sponsor_pain` | BOOLEAN | Es sponsor de pain point |
| `sponsor_icp` | BOOLEAN | Es sponsor ICP |

### Campos de Compromiso
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `commit_speaking_keynote` | ARRAY/JSON | Commitment keynote speaking |
| `commit_speaking_workshop` | ARRAY/JSON | Commitment workshop speaking |
| `commit_works` | ARRAY/JSON | Commitment works |
| `commit_stand` | TEXT | Commitment stand |
| `commit_experi` | TEXT | Commitment experience |

### Campos de Auditoría
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

---

## 🔄 Relaciones

### deal_stages (Tabla de Etapas)
- **Campos**: id (UUID), name (TEXT), order (NUMERIC)
- **Relación**: deals.stage_id → deal_stages.id
- **Etapas Encontradas**:
  - Discovery realizada
  - Propuesta en construcción
  - Propuesta presentada
  - Committed
  - Cierre ganado

---

## 📈 Datos Estadísticos

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| deals | 589 | Deals activos y cerrados |
| deal_stages | 8 | Definición de etapas |
| companies | 1,731 | Empresas en la base |
| contacts | 1,951 | Contactos |
| deal_contacts | 3 | Relaciones contacto-deal |
| activities | 3,189 | Log de actividades |
| events | 3 | Eventos (CTW, AI Summit, etc.) |
| meeting_goals | 12 | Metas de meetings |

---

## ✅ Cambios Implementados

### 1. **Actualización de `lib/supabase.ts`**
   - ✅ Interface `ProcessedDeal` ampliada con 28 campos
   - ✅ Función `parseDeal()` mapea todos los campos
   - ✅ Query `fetchAllDeals()` trae todos los campos
   - ✅ Soporte para JOIN con deal_stages
   - ✅ Fallback automático si JOIN falla

### 2. **Campos Mapeados en ProcessedDeal**
   ```typescript
   // Core
   id, name, stage, value, currency, event
   
   // Personas
   contacto_ae, contacto_sdr, secondary_ae
   
   // Dates
   created_at, stage_changed_at, expected_close_date, 
   billing_date, collection_date
   
   // Context
   company_name, notes, meeting_id, lost_reason, checklist
   
   // Ecosystem
   paquete_vendido, adicionales_para, sponsor_pain, 
   sponsor_icp
   
   // Commitments
   commit_speaking, commit_works, commit_stand, commit_experi
   ```

### 3. **Stage Name Mapping**
   Mapeo de nombres de Supabase a nombres del dashboard:
   - "Discovery realizada" → "Discovery Realizado"
   - "Propuesta en construcción" → "Propuesta en construcción"
   - "Propuesta presentada" → "Propuesta presentada"
   - "Committed" → "🤝 Committed"
   - "Cierre ganado" → "🎉 Cierre Ganado"

---

## 🎯 Impacto en el Dashboard

### Datos Ahora Disponibles
- ✅ Información completa de empresas en cada deal
- ✅ Fechas de cierre, facturación y cobranza
- ✅ Track de commitments (keynotes, workshops, stands)
- ✅ Información de eco-sistema (sponsorships, paquetes)
- ✅ Auditoría completa (created_at, updated_at)

### Cálculos Mejorados
- Revenue tracking con fechas reales
- Pipeline por fecha esperada vs actual
- AE accountability por etapa
- Eco-sistema tracking (sponsor deals)

### Nuevas Capacidades
- Reportes por commitment type
- Análisis de co-vending
- Tracking de paquetes vendidos
- Sponsor pain point analysis

---

## 🚀 Próximas Mejoras Sugeridas

1. **Crear vistas nuevas en el dashboard**:
   - Reporte de commitments
   - Análisis de paquetes vendidos
   - Sponsor deals dashboard

2. **Integrar nueva información**:
   - Expected close date en pipeline forecast
   - Commitment tracking en AE scorecards
   - Sponsor analysis en executive view

3. **Auditoría y compliance**:
   - Timeline de cambios (created_at vs updated_at)
   - Lost reason analysis
   - Collection vs billing tracking

---

## 📝 Notas Importantes

1. **Todos los campos son opcionales** en ProcessedDeal - si Supabase devuelve NULL, se usan valores por defecto
2. **El mapeo es bidireccional**: Los campos de Supabase se mapean a ProcessedDeal, que luego usa business-logic.ts
3. **La paginación sigue funcionando** con 500 registros por página
4. **El caché sigue siendo de 5 minutos** pero ahora incluye todos estos datos

---

**Última actualización**: Junio 5, 2026
**Estado**: Análisis Completo - Listos para Usar
