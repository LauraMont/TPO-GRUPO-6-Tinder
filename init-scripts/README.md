# Setup Rápido: Arquitectura Políglota TPO (TinderLike)

Esta guía rápida contiene los comandos esenciales para levantar la infraestructura, inicializar las bases de datos sincronizadamente y verificar que la información se haya cargado correctamente.

---

## 1. Levantar los Contenedores (Docker)

Asegúrate de estar en la carpeta raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`) y ejecuta:

```bash
# Levantar toda la arquitectura en segundo plano
docker-compose up -d

# (Opcional) Verificar que los 5 contenedores estén corriendo
docker-compose ps
```

---

## 2. Ejecutar el Sembrado Maestro (Seed)

Para garantizar la integridad referencial (los mismos UUIDs) en PostgreSQL, MongoDB y Neo4j, utilizamos un script maestro de Python que limpia e inicializa todo el entorno en un solo paso.

**Prerrequisitos:** Asegúrate de tener las librerías necesarias en tu entorno virtual:
```bash
pip install psycopg2-binary pymongo neo4j
```

**Ejecutar el script:**
Desde la raíz de tu proyecto backend, ejecuta:
```bash
python seed.py
```
*Este script borrará los datos antiguos y sembrará los 16 perfiles de prueba con URLs de imágenes públicas, intereses y un historial de Likes abierto.*

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

### MongoDB (Perfiles y Fotos)

```bash
docker exec -it tinderlike_mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

```javascript
use flame_db; // O el nombre que estés usando (ej. tinderlike_db)
db.profiles.find().pretty();
exit
```

### Neo4j (Grafo Social e Intereses)

```bash
docker exec -it tinderlike_neo4j cypher-shell -u neo4j -p password123
```

```cypher
// Verificar los usuarios
MATCH (u:Usuario) RETURN u.id, u.nombre;

// Verificar las relaciones de intereses y likes
MATCH (n1)-[r]->(n2) RETURN n1.nombre, type(r), n2.nombre LIMIT 20;
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

