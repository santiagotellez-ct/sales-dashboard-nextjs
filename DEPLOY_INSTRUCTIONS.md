# 🚀 Instrucciones de Deploy

## Opción 1: Ejecutar Script Batch (Más Fácil - Windows)

1. Abre **PowerShell** o **Command Prompt** en la carpeta del proyecto
2. Ejecuta:
```bash
.\deploy.bat
```

El script hará automáticamente:
- ✅ Instalar dependencias (`npm install`)
- ✅ Compilar el proyecto (`npm run build`)
- ✅ Hacer commit de cambios (`git commit`)
- ✅ Hacer push a GitHub (`git push`)

---

## Opción 2: Ejecutar Script PowerShell (Más Bonito - Windows)

1. Abre **PowerShell** en la carpeta del proyecto
2. Permite ejecución de scripts (si no lo has hecho):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. Ejecuta:
```powershell
.\deploy.ps1
```

---

## Opción 3: Ejecutar Manualmente (Control Total)

Si prefieres hacerlo paso a paso:

### Paso 1: Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### Paso 2: Compilar proyecto
```bash
npm run build
```

### Paso 3: Preparar cambios
```bash
git add -A
```

### Paso 4: Crear commit
```bash
git commit -m "feat: complete lovable analysis and supabase integration with all 28 fields"
```

### Paso 5: Push a GitHub
```bash
git push origin main
```

---

## Opción 4: Solo Git (Si ya instalaste dependencias)

Si npm install ya completó:

```bash
git add -A
git commit -m "feat: complete lovable analysis and supabase integration with all 28 fields"
git push origin main
```

---

## ✅ Verificación

Después de ejecutar:

1. **Verifica que el build fue exitoso**:
   - Debe existir carpeta `.next/`
   - No debe haber errores en la consola

2. **Verifica que subió a GitHub**:
   - Abre https://github.com/santiagotellez-ct/sales-dashboard-nextjs
   - Verifica que veas los archivos actualizados
   - Verifica el último commit

3. **Prueba localmente**:
```bash
npm run dev
```
Luego abre: http://localhost:3000

---

## 📝 Archivos Modificados en Este Deploy

### Nuevos Archivos
- ✅ `lib/supabase.ts` - Cliente Supabase completo
- ✅ `LOVABLE_ANALYSIS.md` - Análisis técnico
- ✅ `CHANGES_SUMMARY.md` - Resumen de cambios
- ✅ `SUPABASE_MIGRATION_COMPLETE.md` - Guía de migración
- ✅ `MIGRATION_STATUS.md` - Estado de migración
- ✅ `deploy.bat` - Script de deploy batch
- ✅ `deploy.ps1` - Script de deploy PowerShell
- ✅ `DEPLOY_INSTRUCTIONS.md` - Este archivo

### Archivos Actualizados
- ✅ `package.json` - Agregada dependencia Supabase
- ✅ `lib/business-logic.ts` - Cambió import a Supabase
- ✅ `app/api/executive/[quarter]/route.ts` - Cambió import
- ✅ `app/api/ae/[quarter]/route.ts` - Cambió import
- ✅ `app/api/sdr/[quarter]/route.ts` - Cambió import
- ✅ `app/api/pipeline-review/[quarter]/route.ts` - Cambió import
- ✅ `app/api/cache/route.ts` - Cambió import
- ✅ `app/api/cache/clear/route.ts` - Cambió import
- ✅ `app/api/quarters/route.ts` - Cambió import

---

## 🎯 Estado Final

**Después del deploy, tu proyecto tendrá:**

✅ Integración completa con Supabase
✅ Todos los 28 campos de Supabase mapeados
✅ Build compilando sin errores
✅ Cambios en GitHub
✅ Documentación completa

**Estará listo para:**
- Ejecutar `npm run dev` y ver el dashboard
- Usar en producción
- Expandir con nuevos reportes

---

## ❓ Problemas Comunes

### Error: "npm: command not found"
- Node.js no está instalado
- Descarga: https://nodejs.org/

### Error: "git: command not found"
- Git no está instalado
- Descarga: https://git-scm.com/

### Error: "Authentication failed"
- Tu token de GitHub no es válido
- Configura tu token: `git config --global user.token YOUR_TOKEN`

### Error: "Changes already exist"
- Cambios ya están en el repo
- Ejecuta: `git status` para ver qué pasó

---

## 📞 Próximos Pasos Después del Deploy

1. **Verificar que funciona**:
```bash
npm run dev
# Abre http://localhost:3000
```

2. **Ver logs de Supabase**:
- Los logs aparecerán en la consola con prefijo `[supabase]`

3. **Probar los endpoints**:
- http://localhost:3000/api/executive/Q1%202026
- http://localhost:3000/api/quarters
- http://localhost:3000/api/cache

---

**¡Listo para deployar!** 🚀
