# Backend Python para Tinder

API en FastAPI conectada a MongoDB para perfiles y a Neo4j para relaciones.

## Endpoints

- `GET /api/discover/feed`
- `POST /api/swipe/like/{userId}`
- `POST /api/swipe/pass/{userId}`
- `GET /api/matches`

## Autenticacion

Por ahora no es obligatoria. Si no envias `X-User-Id`, la API usa el usuario `anonymous` para poder probar los endpoints sin login.

Si quieres simular distintos usuarios, puedes enviar el header:

```bash
curl -H "X-User-Id: user-123" http://localhost:8000/api/discover/feed
```

## Modo actual

Los perfiles se leen desde MongoDB en la colección `profiles` y Neo4j queda para `LIKES`, `PASSED` y `MATCHES`.

## Variables de entorno

- `NEO4J_URI` - por defecto `bolt://localhost:7687`
- `NEO4J_USER` - por defecto `neo4j`
- `NEO4J_PASSWORD` - por defecto `password123`
- `NEO4J_DATABASE` - por defecto `neo4j`
- `MONGO_URI` - por defecto `mongodb://testuser:abc123@localhost:27017/tinderlike_db?authSource=tinderlike_db`
- `MONGO_DB` - por defecto `tinderlike_db`
- `MONGO_COLLECTION` - por defecto `profiles`
- `FEED_LIMIT` - por defecto `20`

## Instalacion

```bash
pip install -r requirements.txt
```

## Ejecutar

```bash
uvicorn app.main:app --reload
```

## Ejecutar con el compose padre ya levantado

Si ya tienes arriba el `docker-compose.yml` de la carpeta raíz, MongoDB queda expuesto en `localhost:27017` y Neo4j en `localhost:7687`.

En ese caso, levanta el backend desde `BackEnd/` con:

```bash
uvicorn app.main:app --reload
```

Si en algún momento corres el backend dentro de un contenedor separado, usa `host.docker.internal` en `MONGO_URI` y `NEO4J_URI` para apuntar a esas bases publicadas por Docker Desktop.
Para MongoDB, conserva el usuario de aplicación `testuser` con `authSource=tinderlike_db`.

## Modelo de datos esperado en Neo4j

- Nodos `:User` con propiedad `id`
- Relacion `:LIKES`
- Relacion `:PASSED`
- Relacion `:MATCHES`

Opcionalmente puedes agregar propiedades como `name`, `bio`, `photos`, `latitude`, `longitude` y `last_active_at`.
