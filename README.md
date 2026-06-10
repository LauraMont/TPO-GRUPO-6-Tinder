# TinderLike – Arquitectura Políglota (UADE Ingeniería de Datos II)

Aplicación de citas tipo Tinder con arquitectura políglota usando 5 bases de datos:
**PostgreSQL · MongoDB · Redis · Cassandra · Neo4j**

---

## 🏗️ Arquitectura

| Base de Datos | Responsable | Uso |
|---|---|---|
| PostgreSQL | Miguel Zambrano | Autenticación, roles, BackOffice de eventos |
| MongoDB | Federico Egea | Perfiles, intereses, detalles de eventos |
| Redis | Santiago Paglino | Caché de sesiones, feed en tiempo real |
| Cassandra | Andres Mazzucco | Historial de swipes, telemetría masiva |
| Neo4j | Laura Montaño | Grafo social, recomendaciones, matches |

---

## 🚀 Levantar el proyecto

### Prerequisitos
- Docker Desktop instalado y corriendo
- Git

### Pasos

```bash
# 1. Clonar / descomprimir el proyecto
cd TinderLike

# 2. Levantar todas las bases de datos y servicios
docker compose up -d

# 3. Esperar ~30 segundos que todos los servicios inicien
# (Cassandra tarda ~60s en estar lista)

# 4. Ejecutar el seed de datos de prueba
docker exec tinderlike_backend python /app/seed.py

# 5. Abrir la app
open http://localhost:5173
```

### URLs de servicios

| Servicio | URL |
|---|---|
| **Frontend (React)** | http://localhost:5173 |
| **Backend (FastAPI)** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |
| **Neo4j Browser** | http://localhost:7474 |

---

## 👥 Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@uade.edu.ar | admin123 | **ADMIN** |
| laura@ejemplo.com | password123 | Usuario |
| fede@ejemplo.com | password123 | Usuario |

---

## 📱 Pantallas

- **Login / Registro** – Autenticación JWT con PostgreSQL
- **Swipe** – Feed de perfiles desde MongoDB + Neo4j, swipes guardados en Cassandra
- **Match** – Modal animado cuando hay match mutuo (grafo Neo4j)
- **Chats** – Lista de matches y conversaciones
- **Eventos (IRL)** – Explorar eventos sociales desde MongoDB/PostgreSQL
- **Perfil** – Editar perfil guardado en MongoDB
- **Admin (ADMIN only)** – Crear/editar/eliminar eventos en PostgreSQL

---

## 🔧 Desarrollo local (sin Docker)

### Backend
```bash
cd BackEnd
pip install -r requirements.txt

# Variables de entorno
export DATABASE_URL=postgresql://admin:password123@localhost:5432/tinderlike_auth
export MONGO_URI=mongodb://admin:password123@localhost:27018
export MONGO_DB=tinderlike
export REDIS_URL=redis://localhost:6379
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=password123

uvicorn app.main:app --reload
```

### Frontend
```bash
cd FrontEnd
npm install
npm run dev
```

---

## 🗄️ Endpoints principales

```
POST /auth/register          – Crear cuenta
POST /auth/login             – Login → JWT token
GET  /profile/me             – Obtener perfil (MongoDB)
PUT  /profile/me             – Actualizar perfil (MongoDB)
GET  /api/discover/feed      – Feed de swipe (MongoDB + Neo4j)
POST /api/swipe/like/{id}    – Like → detecta match (Neo4j + Cassandra)
POST /api/swipe/pass/{id}    – Pass (Neo4j + Cassandra)
GET  /api/matches            – Lista de matches (Neo4j)
GET  /admin/events           – Listar eventos (PostgreSQL)
POST /admin/events           – Crear evento (ADMIN)
PUT  /admin/events/{id}      – Editar evento (ADMIN)
DELETE /admin/events/{id}    – Eliminar evento (ADMIN)
```
