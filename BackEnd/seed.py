"""
Seed script – run after docker compose up:
  docker exec tinderlike_backend python /app/seed.py
"""
import os, sys, hashlib
from pymongo import MongoClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ── Config ────────────────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password123@localhost:27018")
MONGO_DB  = os.getenv("MONGO_DB", "tinderlike")
PG_URL    = os.getenv("DATABASE_URL", "postgresql://admin:password123@localhost:5432/tinderlike_auth")

def sha256(s): return hashlib.sha256(s.encode()).hexdigest()

# ── PostgreSQL ────────────────────────────────────────────────────────────────
print("➤ PostgreSQL: creating tables & seed users…")
engine = create_engine(PG_URL)
with engine.connect() as conn:
    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password_hash VARCHAR NOT NULL,
        role VARCHAR DEFAULT 'USER',
        created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT,
        location VARCHAR,
        event_date VARCHAR,
        tags VARCHAR,
        status VARCHAR DEFAULT 'Publicado',
        created_at TIMESTAMPTZ DEFAULT now()
    );
    """))

    # Seed users
    for name, email, pwd, role in [
        ("Admin UADE", "admin@uade.edu.ar", "admin123", "ADMIN"),
        ("Laura Montaño", "laura@ejemplo.com", "password123", "USER"),
        ("Federico Egea", "fede@ejemplo.com", "password123", "USER"),
    ]:
        existing = conn.execute(text("SELECT id FROM users WHERE email=:e"), {"e": email}).fetchone()
        if not existing:
            conn.execute(text(
                "INSERT INTO users (name,email,password_hash,role) VALUES (:n,:e,:p,:r)"
            ), {"n": name, "e": email, "p": sha256(pwd), "r": role})

    # Seed events
    event_count = conn.execute(text("SELECT COUNT(*) FROM events")).scalar()
    if event_count == 0:
        for ev in [
            ("Sunset Rooftop Party", "Fiesta exclusiva con vista panorámica.", "Terraza Trade Skybar, CABA", "2026-06-24T18:00:00", "Fiestas", "Publicado"),
            ("Cata de Vinos a Ciegas", "Descubrí vinos únicos.", "Palermo Soho", "2026-06-28T20:30:00", "Gastronomía", "Publicado"),
            ("Trekking y Mates", "Caminata grupal por la reserva ecológica.", "Reserva Ecológica", "2026-07-02T10:00:00", "Deportes", "Publicado"),
            ("Workshop de Fotografía", "Técnicas de retrato con profesionales.", "Palermo Hollywood", "2026-07-10T15:00:00", "Talleres", "Publicado"),
        ]:
            conn.execute(text(
                "INSERT INTO events (title,description,location,event_date,tags,status) VALUES (:t,:d,:l,:dt,:tg,:s)"
            ), dict(t=ev[0], d=ev[1], l=ev[2], dt=ev[3], tg=ev[4], s=ev[5]))

    conn.commit()
print("  ✓ PostgreSQL ready")

# ── MongoDB ───────────────────────────────────────────────────────────────────
print("➤ MongoDB: seeding profiles…")
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
profiles = db["profiles"]

SAMPLE_PROFILES = [
    {"userId": "user_2", "name": "Valentina", "age": 25, "bio": "Arquitecta. Amante del café y la fotografía urbana.", "interests": ["Fotografía", "Café", "Arquitectura"], "photos": [], "location": "A 3 km de distancia", "gender": "Mujer"},
    {"userId": "user_3", "name": "Sofía", "age": 24, "bio": "Diseñadora gráfica. Viajo siempre que puedo 🌍", "interests": ["Diseño", "Viajes", "Música"], "photos": [], "location": "A 5 km de distancia", "gender": "Mujer"},
    {"userId": "user_4", "name": "Martina", "age": 27, "bio": "Psicóloga. Me encanta el arte contemporáneo.", "interests": ["Arte", "Lectura", "Yoga"], "photos": [], "location": "A 8 km de distancia", "gender": "Mujer"},
    {"userId": "user_5", "name": "Julieta", "age": 23, "bio": "Estudiante de derecho. Apasionada por la cocina italiana.", "interests": ["Cocina", "Vinos", "Teatro"], "photos": [], "location": "A 2 km de distancia", "gender": "Mujer"},
    {"userId": "user_6", "name": "Carolina", "age": 26, "bio": "Chef profesional. Amo los mercados y los madrugones.", "interests": ["Gastronomía", "Running", "Mercados"], "photos": [], "location": "A 12 km de distancia", "gender": "Mujer"},
    {"userId": "user_7", "name": "Mateo", "age": 28, "bio": "Dev y gamer. Hablo de memes y tecnología.", "interests": ["Tecnología", "Gaming", "Música"], "photos": [], "location": "A 4 km de distancia", "gender": "Hombre"},
    {"userId": "user_8", "name": "Santiago", "age": 30, "bio": "Músico indie. Toco en bares los fines de semana.", "interests": ["Música", "Viajes", "Fotografía"], "photos": [], "location": "A 7 km de distancia", "gender": "Hombre"},
]

for p in SAMPLE_PROFILES:
    profiles.update_one({"userId": p["userId"]}, {"$setOnInsert": p}, upsert=True)

# Seed eventos_detalles
eventos = db["eventos_detalles"]
if eventos.count_documents({}) == 0:
    eventos.insert_many([
        {"id": "ev_001", "titulo": "Sunset Rooftop Party", "descripcion": "Fiesta exclusiva con vista panorámica.", "organizador_tipo": "BACK_OFFICE", "tags": ["Fiestas", "Música", "Drinks"], "fecha_hora": "2026-06-24T18:00:00Z", "ubicacion_nombre": "Terraza Trade Skybar, CABA", "asistentes": [], "featured": True},
        {"id": "ev_002", "titulo": "Cata de Vinos a Ciegas", "descripcion": "Descubrí vinos únicos.", "organizador_tipo": "BACK_OFFICE", "tags": ["Gastronomía"], "fecha_hora": "2026-06-28T20:30:00Z", "ubicacion_nombre": "Palermo Soho", "asistentes": []},
        {"id": "ev_003", "titulo": "Trekking y Mates", "descripcion": "Caminata grupal por la reserva.", "organizador_tipo": "BACK_OFFICE", "tags": ["Deportes"], "fecha_hora": "2026-07-02T10:00:00Z", "ubicacion_nombre": "Reserva Ecológica", "asistentes": []},
    ])

client.close()
print("  ✓ MongoDB ready")

print("\n✅ Seed completado. Usuarios de prueba:")
print("   admin@uade.edu.ar  / admin123  (ADMIN)")
print("   laura@ejemplo.com  / password123")
print("   fede@ejemplo.com   / password123")
