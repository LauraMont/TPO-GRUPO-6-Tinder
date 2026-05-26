# Setup Rápido: Arquitectura Políglota TPO (TinderLike)

Esta guía rápida contiene los comandos esenciales para levantar la infraestructura, inicializar las bases de datos y verificar que la información se haya cargado correctamente.

---

## 1. Levantar los Contenedores (Docker)

Asegúrate de estar en la carpeta raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`) y ejecuta:

```bash
# Levantar toda la arquitectura en segundo plano
docker-compose up -d

# (Opcional) Verificar que los 5 contenedores estén corriendo
docker-compose ps

```

*Nota: Si es la primera vez que levantas el proyecto, PostgreSQL y MongoDB se sembrarán automáticamente gracias a los volúmenes mapeados.*

---

## 2. Ejecutar el Sembrado de Datos (Seed Script)

Una vez que los contenedores estén corriendo, debes inyectar los datos en Neo4j y Cassandra ejecutando el script de Node.js.

```bash
# Instalar los drivers si aún no lo has hecho
npm install neo4j-driver cassandra-driver

# Ejecutar el script sembrador
node seed.js

```

*El script realizará reintentos automáticos hasta que las bases de datos estén listas para recibir la información.*

---

## 3. Verificación de Datos por Base de Datos

Utiliza los siguientes comandos en tu terminal para entrar a cada contenedor y validar que la data coincida en todos los motores.

### PostgreSQL (Autenticación)

```bash
docker exec -it tinderlike_postgres psql -U admin -d tinderlike_auth

```

```sql
SELECT id, name, email FROM users;
\q

```

### MongoDB (Perfiles y Chats)

```bash
docker exec -it tinderlike_mongodb mongosh -u admin -p password123 --authenticationDatabase admin

```

```javascript
use tinderlike_db;
db.profiles.find().pretty();
exit

```

### Neo4j (Grafo Social)

```bash
docker exec -it tinderlike_neo4j cypher-shell -u neo4j -p password123

```

```cypher
MATCH (u:User) RETURN u.userId, u.name;
MATCH (u1)-[r]->(u2) RETURN u1.name, type(r), u2.name;
:exit

```

### Cassandra (Logs e Historial)

```bash
docker exec -it tinderlike_cassandra cqlsh

```

```cql
USE tinderlike;
SELECT * FROM swipe_history;
EXIT;

```

### Redis (Caché y Sesiones)

*Redis inicia vacío y se llena dinámicamente con el uso de la aplicación.*

```bash
docker exec -it tinderlike_redis redis-cli

```

```bash
KEYS *
exit

```