// init-mongo.js – ejecutado automáticamente por MongoDB al iniciar por primera vez
db = db.getSiblingDB('tinderlike');

// Crear colecciones con índices
db.createCollection('profiles');
db.profiles.createIndex({ userId: 1 }, { unique: true });
db.profiles.createIndex({ "location.coordinates": "2dsphere" });

db.createCollection('eventos_detalles');
db.eventos_detalles.createIndex({ "ubicacion.coordinates": "2dsphere" });
db.eventos_detalles.createIndex({ fecha_hora: 1 });

db.createCollection('messages');
db.messages.createIndex({ conversation_id: 1, created_at: -1 });

print('MongoDB collections and indexes created.');
