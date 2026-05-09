# 🚀 GUÍA DE INSTALACIÓN - GITHUB INSIGHTS PRO

## 📋 PREREQUISITOS

- **Docker Desktop** 24.0+ (para opción con Docker)
- **.NET SDK** 8.0+ (para desarrollo local)
- **Node.js** 20+ (para desarrollo local)
- **Git** instalado

---

## ⚡ INSTALACIÓN RÁPIDA (Docker - Recomendado)

### **Paso 1: Clonar el Repositorio**

```bash
git clone https://github.com/marius1973/GitHubInsightsPro.git
cd GitHubInsightsPro
```

### **Paso 2: Configurar Variables de Entorno (Opcional)**

```bash
# Crear archivo .env
echo "GITHUB_TOKEN=tu_token_aqui" > .env
```

**Nota:** El token de GitHub es opcional pero recomendado para evitar rate limiting (60 req/hora sin token vs 5000 req/hora con token).

**Cómo obtener un token:**
1. Ve a GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Selecciona scopes: `public_repo`, `read:user`
4. Copia el token

### **Paso 3: Levantar el Sistema**

```bash
docker-compose up -d
```

Esto iniciará:
- ✅ Redis (cache)
- ✅ Backend API (.NET 8)
- ✅ Frontend (React)

### **Paso 4: Acceder a la Aplicación**

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
Swagger UI: http://localhost:5000/swagger
```

---

## 💻 DESARROLLO LOCAL (Sin Docker)

### **Backend (.NET)**

```bash
# 1. Ir a carpeta backend
cd backend

# 2. Instalar Redis (con Docker)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# 3. Restaurar dependencias
dotnet restore

# 4. Ejecutar
dotnet run

# Backend disponible en http://localhost:5000
# Swagger UI en http://localhost:5000/swagger
```

### **Frontend (React)**

```bash
# 1. Ir a carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar API URL
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 4. Ejecutar
npm run dev

# Frontend disponible en http://localhost:5173
```

---

## 🧪 VERIFICAR INSTALACIÓN

### **1. Health Check del Backend**

```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-05T...",
  "service": "GitHubInsightsPro Backend"
}
```

### **2. Probar API**

```bash
# Obtener datos de un usuario
curl http://localhost:5000/api/user/marius1973

# Ver lenguajes
curl http://localhost:5000/api/user/marius1973/languages

# Ver actividad
curl http://localhost:5000/api/user/marius1973/activity
```

### **3. Probar Frontend**

Abre http://localhost:5173 en tu navegador y busca tu usuario de GitHub.

---

## 🔧 CONFIGURACIÓN AVANZADA

### **appsettings.json (Backend)**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "Redis": "localhost:6379"
  },
  "GitHub": {
    "Token": ""  // Agregar tu token aquí
  }
}
```

### **Configurar CORS (Backend)**

Si necesitas permitir otros orígenes, edita `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://tu-dominio.com"  // Agregar tu dominio
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

---

## 🚢 DEPLOY EN PRODUCCIÓN

### **Frontend → Vercel**

```bash
cd frontend

# Build
npm run build

# Deploy con Vercel CLI
npm i -g vercel
vercel --prod
```

### **Backend → Railway**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### **Backend → Azure**

```bash
# Crear App Service
az webapp create --name github-insights-api --resource-group mygroup

# Deploy
az webapp deployment source config-zip --src backend.zip
```

---

## 📊 MONITOREO

### **Ver Logs del Backend**

```bash
# Con Docker
docker logs -f github-insights-backend

# Sin Docker
# Los logs aparecen en la consola donde ejecutaste dotnet run
```

### **Ver Logs de Redis**

```bash
docker logs -f github-insights-redis
```

### **Verificar Cache de Redis**

```bash
# Conectar a Redis
docker exec -it github-insights-redis redis-cli

# Ver todas las keys
KEYS *

# Ver contenido de una key
GET user:marius1973
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Cannot connect to Redis"**

```bash
# Verificar que Redis esté corriendo
docker ps | grep redis

# Si no está, iniciarlo
docker-compose up -d redis

# Probar conexión
docker exec -it github-insights-redis redis-cli ping
# Debe responder: PONG
```

### **Error: "User not found" en API**

- Verifica que el username existe en GitHub
- Si usas token, verifica que sea válido
- Revisa los logs del backend

### **Error: "Rate limit exceeded"**

- Estás haciendo demasiadas peticiones sin token
- Configura un GitHub Personal Access Token
- Espera 1 hora para que se resetee el límite

### **Frontend no se conecta al Backend**

```bash
# Verificar que el backend esté corriendo
curl http://localhost:5000/health

# Verificar variable de entorno en frontend
cat frontend/.env
# Debe mostrar: VITE_API_URL=http://localhost:5000/api

# Reiniciar frontend
cd frontend
npm run dev
```

### **Puerto ya en uso**

```bash
# Si el puerto 5000 está ocupado, cambiar en docker-compose.yml
# O detener el servicio que lo usa
lsof -i :5000
kill -9 <PID>
```

---

## 🔄 ACTUALIZAR EL SISTEMA

```bash
# Pull cambios
git pull origin main

# Rebuild con Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# O sin Docker
cd backend && dotnet restore && dotnet run &
cd frontend && npm install && npm run dev
```

---

## 🧹 LIMPIAR TODO

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes (borra cache)
docker-compose down -v

# Eliminar imágenes
docker rmi github-insights-backend github-insights-frontend

# Limpiar todo Docker
docker system prune -a
```

---

## ✅ CHECKLIST DE INSTALACIÓN

```
□ Docker Desktop instalado y corriendo
□ Repositorio clonado
□ Token de GitHub configurado (opcional)
□ docker-compose up exitoso
□ Backend responde en localhost:5000
□ Frontend carga en localhost:5173
□ Búsqueda de usuario funciona
□ Gráficos se muestran correctamente
□ Cache de Redis funciona
```

---

## 📞 SOPORTE

**¿Problemas durante la instalación?**

1. Revisa los logs: `docker-compose logs -f`
2. Consulta esta guía completa
3. Abre un issue: https://github.com/marius1973/GitHubInsightsPro/issues
4. Email: marius1973@gmail.com

---

**¡Sistema listo para usar!** 🎉

**Siguiente paso:** Busca tu usuario de GitHub y explora tus estadísticas.
