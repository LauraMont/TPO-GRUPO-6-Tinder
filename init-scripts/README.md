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

## 2. Ejecutar el Sembrado de Datos de MongoDB

MongoDB se inicializa automáticamente con `init-mongo.js` cuando el contenedor arranca por primera vez.

Si quieres resembrar la colección manualmente, puedes ejecutar el script dentro del contenedor Mongo:

```bash
docker exec -it tinderlike_mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

```javascript
use tinderlike_db;
load('/docker-entrypoint-initdb.d/init.js');
exit
```

*Ese script solo carga perfiles en MongoDB; no inicializa Neo4j ni Cassandra.*

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