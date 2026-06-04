import os
import sys
from pymongo import MongoClient
from neo4j import GraphDatabase

# Intentar importar el driver de PostgreSQL
try:
    import psycopg2
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False

# ==========================================
# CONFIGURACIONES DE CONEXIÓN
# ==========================================
PG_URI = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/flame_db")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = "flame_db"
MONGO_COLLECTION = "profiles"
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

# ==========================================
# ESTRUCTURAS DE DATOS COMPARTIDAS
# ==========================================
USERS_SQL_DATA = [
    ('a1b2c3d4-0000-0000-0000-000000000001', 'Miguel Zambrano', 'miguel@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000002', 'Federico Egea', 'federico@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000003', 'Santiago Paglino', 'santiago@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000004', 'Andres Mazzucco', 'andres@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000005', 'Laura Montaño', 'laura@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000006', 'Valentina Rossi', 'valentina@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000007', 'Camila Gomez', 'camila@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000008', 'Lucia Fernandez', 'lucia@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000009', 'Florencia Silva', 'florencia@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000010', 'Micaela Torres', 'micaela@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000011', 'Carlos Perez', 'carlos@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000012', 'Sofia Gonzalez', 'sofia@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000013', 'Nicolas Herrera', 'nicolas@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000014', 'Paula Martinez', 'paula@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000015', 'Julian Alvarez', 'julian@example.com', 'hash_123'),
    ('a1b2c3d4-0000-0000-0000-000000000016', 'Mara Dominguez', 'mara@example.com', 'hash_123')
]

MONGO_PROFILES_DATA = [
    {"userId": "a1b2c3d4-0000-0000-0000-000000000001", "name": "Miguel", "age": 26, "bio": "Experto en bases de datos relacionales y seguridad. Si logras hackear mi corazón, te invito un café ☕", "interests": ["PostgreSQL", "Ciberseguridad", "Tecnología", "Café"], "photos": ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000002", "name": "Federico", "age": 25, "bio": "Amante del código limpio y las bases de datos documentales. Siempre dispuesto a una buena charla sobre arquitectura.", "interests": ["MongoDB", "Arquitectura", "Música Indie"], "photos": ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000003", "name": "Santiago", "age": 24, "bio": "Vivo la vida en tiempo real y sin latencia. Fanático del alto rendimiento y los deportes.", "interests": ["Redis", "WebSockets", "Fútbol", "Gaming"], "photos": ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000004", "name": "Andres", "age": 27, "bio": "Almaceno buenos momentos a nivel masivo. Me encanta la naturaleza y la fotografía.", "interests": ["Cassandra", "Fotografía", "Senderismo"], "photos": ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000005", "name": "Laura", "age": 23, "bio": "Trazando conexiones y diseñando experiencias. Buscando a alguien que sea el nodo perfecto en mi grafo.", "interests": ["Neo4j", "UX/UI Design", "Arte", "Viajes"], "photos": ["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000006", "name": "Valentina", "age": 25, "bio": "Arquitecta en la UBA. Amo recorrer la ciudad buscando cafeterías de especialidad.", "interests": ["Arquitectura", "Café", "Fotografía"], "photos": ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000007", "name": "Camila", "age": 24, "bio": "Estudiante de veterinaria. Tengo dos perros que son mi vida 🐶", "interests": ["Animales", "Naturaleza", "Series"], "photos": ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000008", "name": "Lucia", "age": 26, "bio": "Cinéfila empedernida. Siempre lista para un maratón de películas los domingos.", "interests": ["Cine", "Literatura", "Música"], "photos": ["https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000009", "name": "Florencia", "age": 22, "bio": "Bailarina y estudiante de artes. Buscando gente copada para salir a bailar.", "interests": ["Danza", "Fiestas", "Arte"], "photos": ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000010", "name": "Micaela", "age": 28, "bio": "Chef profesional. Te puedo conquistar por el estómago 🍝", "interests": ["Gastronomía", "Vinos", "Viajes"], "photos": ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000011", "name": "Carlos", "age": 29, "bio": "Ingeniero de software. Fanático del asado de los domingos.", "interests": ["Tecnología", "Asado", "Fútbol"], "photos": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000012", "name": "Sofia", "age": 24, "bio": "Diseñadora gráfica. Me encanta probar cosas nuevas y salir de mi zona de confort.", "interests": ["Diseño", "Aventuras", "Pintura"], "photos": ["https://images.unsplash.com/photo-1440589473619-3cde28941638?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000013", "name": "Nicolas", "age": 27, "bio": "Desarrollador backend y fanático del café fuerte. Siempre buscando el próximo proyecto.", "interests": ["Backend", "Café", "Arquitectura"], "photos": ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000014", "name": "Paula", "age": 23, "bio": "Estudiante de diseño y fotógrafa amateur. Me gustan los planes tranquilos y las charlas largas.", "interests": ["Diseño", "Fotografía", "Libros"], "photos": ["https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000015", "name": "Julian", "age": 30, "bio": "Ingeniero de datos, runner y amante de la tecnología. Si hay una montaña, quiero subirla.", "interests": ["Data", "Running", "Tecnología"], "photos": ["https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=600&q=80"]},
    {"userId": "a1b2c3d4-0000-0000-0000-000000000016", "name": "Mara", "age": 26, "bio": "Profesora de inglés y fan de los viajes improvisados. Busco alguien con buen humor.", "interests": ["Viajes", "Idiomas", "Música"], "photos": ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80"]}
]

NEO4J_CYPHER_SEED = """
// 1. Limpieza total de Neo4j
MATCH (n) DETACH DELETE n;

// 2. Creación de nodos de Usuario
MERGE (u1:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000001'}) SET u1.nombre = 'Miguel', u1.edad = 26
MERGE (u2:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000002'}) SET u2.nombre = 'Federico', u2.edad = 25
MERGE (u3:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000003'}) SET u3.nombre = 'Santiago', u3.edad = 24
MERGE (u4:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000004'}) SET u4.nombre = 'Andres', u4.edad = 27
MERGE (u5:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000005'}) SET u5.nombre = 'Laura', u5.edad = 23
MERGE (u6:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000006'}) SET u6.nombre = 'Valentina', u6.edad = 25
MERGE (u7:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000007'}) SET u7.nombre = 'Camila', u7.edad = 24
MERGE (u8:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000008'}) SET u8.nombre = 'Lucia', u8.edad = 26
MERGE (u9:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000009'}) SET u9.nombre = 'Florencia', u9.edad = 22
MERGE (u10:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000010'}) SET u10.nombre = 'Micaela', u10.edad = 28
MERGE (u11:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000011'}) SET u11.nombre = 'Carlos', u11.edad = 29
MERGE (u12:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000012'}) SET u12.nombre = 'Sofia', u12.edad = 24
MERGE (u13:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000013'}) SET u13.nombre = 'Nicolas', u13.edad = 27
MERGE (u14:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000014'}) SET u14.nombre = 'Paula', u14.edad = 23
MERGE (u15:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000015'}) SET u15.nombre = 'Julian', u15.edad = 30
MERGE (u16:Usuario {id: 'a1b2c3d4-0000-0000-0000-000000000016'}) SET u16.nombre = 'Mara', u16.edad = 26;

// 3. Creación de nodos de Interés
MERGE (i1:Interes {nombre: 'PostgreSQL'})
MERGE (i2:Interes {nombre: 'Ciberseguridad'})
MERGE (i3:Interes {nombre: 'Tecnología'})
MERGE (i4:Interes {nombre: 'Café'})
MERGE (i5:Interes {nombre: 'MongoDB'})
MERGE (i6:Interes {nombre: 'Arquitectura'})
MERGE (i7:Interes {nombre: 'Música Indie'})
MERGE (i8:Interes {nombre: 'Redis'})
MERGE (i9:Interes {nombre: 'WebSockets'})
MERGE (i10:Interes {nombre: 'Fútbol'})
MERGE (i11:Interes {nombre: 'Gaming'})
MERGE (i12:Interes {nombre: 'Cassandra'})
MERGE (i13:Interes {nombre: 'Fotografía'})
MERGE (i14:Interes {nombre: 'Senderismo'})
MERGE (i15:Interes {nombre: 'Neo4j'})
MERGE (i16:Interes {nombre: 'UX/UI Design'})
MERGE (i17:Interes {nombre: 'Arte'})
MERGE (i18:Interes {nombre: 'Viajes'})
MERGE (i19:Interes {nombre: 'Animales'})
MERGE (i20:Interes {nombre: 'Naturaleza'})
MERGE (i21:Interes {nombre: 'Series'})
MERGE (i22:Interes {nombre: 'Cine'})
MERGE (i23:Interes {nombre: 'Literatura'})
MERGE (i24:Interes {nombre: 'Música'})
MERGE (i25:Interes {nombre: 'Danza'})
MERGE (i26:Interes {nombre: 'Fiestas'})
MERGE (i27:Interes {nombre: 'Gastronomía'})
MERGE (i28:Interes {nombre: 'Vinos'})
MERGE (i29:Interes {nombre: 'Asado'})
MERGE (i30:Interes {nombre: 'Diseño'})
MERGE (i31:Interes {nombre: 'Aventuras'})
MERGE (i32:Interes {nombre: 'Pintura'})
MERGE (i33:Interes {nombre: 'Backend'})
MERGE (i34:Interes {nombre: 'Libros'})
MERGE (i35:Interes {nombre: 'Data'})
MERGE (i36:Interes {nombre: 'Running'})
MERGE (i37:Interes {nombre: 'Idiomas'});

// 4. Relaciones de Intereses
WITH u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u12, u13, u14, u15, u16, i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14, i15, i16, i17, i18, i19, i20, i21, i22, i23, i24, i25, i26, i27, i28, i29, i30, i31, i32, i33, i34, i35, i36, i37
MERGE (u1)-[:INTERESADO_EN]->(i1) MERGE (u1)-[:INTERESADO_EN]->(i2) MERGE (u1)-[:INTERESADO_EN]->(i3) MERGE (u1)-[:INTERESADO_EN]->(i4)
MERGE (u2)-[:INTERESADO_EN]->(i5) MERGE (u2)-[:INTERESADO_EN]->(i6) MERGE (u2)-[:INTERESADO_EN]->(i7)
MERGE (u3)-[:INTERESADO_EN]->(i8) MERGE (u3)-[:INTERESADO_EN]->(i9) MERGE (u3)-[:INTERESADO_EN]->(i10) MERGE (u3)-[:INTERESADO_EN]->(i11)
MERGE (u4)-[:INTERESADO_EN]->(i12) MERGE (u4)-[:INTERESADO_EN]->(i13) MERGE (u4)-[:INTERESADO_EN]->(i14)
MERGE (u5)-[:INTERESADO_EN]->(i15) MERGE (u5)-[:INTERESADO_EN]->(i16) MERGE (u5)-[:INTERESADO_EN]->(i17) MERGE (u5)-[:INTERESADO_EN]->(i18)
MERGE (u6)-[:INTERESADO_EN]->(i6) MERGE (u6)-[:INTERESADO_EN]->(i4) MERGE (u6)-[:INTERESADO_EN]->(i13)
MERGE (u7)-[:INTERESADO_EN]->(i19) MERGE (u7)-[:INTERESADO_EN]->(i20) MERGE (u7)-[:INTERESADO_EN]->(i21)
MERGE (u8)-[:INTERESADO_EN]->(i22) MERGE (u8)-[:INTERESADO_EN]->(i23) MERGE (u8)-[:INTERESADO_EN]->(i24)
MERGE (u9)-[:INTERESADO_EN]->(i25) MERGE (u9)-[:INTERESADO_EN]->(i26) MERGE (u9)-[:INTERESADO_EN]->(i17)
MERGE (u10)-[:INTERESADO_EN]->(i27) MERGE (u10)-[:INTERESADO_EN]->(i28) MERGE (u10)-[:INTERESADO_EN]->(i18)
MERGE (u11)-[:INTERESADO_EN]->(i3) MERGE (u11)-[:INTERESADO_EN]->(i29) MERGE (u11)-[:INTERESADO_EN]->(i10)
MERGE (u12)-[:INTERESADO_EN]->(i30) MERGE (u12)-[:INTERESADO_EN]->(i31) MERGE (u12)-[:INTERESADO_EN]->(i32)
MERGE (u13)-[:INTERESADO_EN]->(i33) MERGE (u13)-[:INTERESADO_EN]->(i4) MERGE (u13)-[:INTERESADO_EN]->(i6)
MERGE (u14)-[:INTERESADO_EN]->(i30) MERGE (u14)-[:INTERESADO_EN]->(i13) MERGE (u14)-[:INTERESADO_EN]->(i34)
MERGE (u15)-[:INTERESADO_EN]->(i35) MERGE (u15)-[:INTERESADO_EN]->(i36) MERGE (u15)-[:INTERESADO_EN]->(i33)
MERGE (u16)-[:INTERESADO_EN]->(i18) MERGE (u16)-[:INTERESADO_EN]->(i37) MERGE (u16)-[:INTERESADO_EN]->(i24);

// 5. Historial de Likes Unidireccionales (Sin Matches iniciales)
WITH u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u12, u13, u14, u15, u16
MERGE (u1)-[:LIKES]->(u6)
MERGE (u2)-[:LIKES]->(u12)
MERGE (u3)-[:LIKES]->(u7)
MERGE (u4)-[:LIKES]->(u14)
MERGE (u5)-[:LIKES]->(u13)
MERGE (u6)-[:LIKES]->(u11)
MERGE (u7)-[:LIKES]->(u15)
MERGE (u8)-[:LIKES]->(u1)
MERGE (u9)-[:LIKES]->(u3)
MERGE (u10)-[:LIKES]->(u11)
MERGE (u11)-[:LIKES]->(u16)
MERGE (u12)-[:LIKES]->(u13)
MERGE (u13)-[:LIKES]->(u6)
MERGE (u14)-[:LIKES]->(u1)
MERGE (u15)-[:LIKES]->(u8)
MERGE (u16)-[:LIKES]->(u2);
"""


# ==========================================
# FUNCIONES DE SEEDING
# ==========================================

def seed_postgresql():
    print("\n--- [1/3] Inicializando PostgreSQL ---")
    if not HAS_POSTGRES:
        print("⚠️  Driver 'psycopg2' no encontrado. Saltando seeding de Postgres.")
        print("   Para habilitarlo ejecuta: pip install psycopg2-binary")
        return

    try:
        conn = psycopg2.connect(PG_URI)
        cursor = conn.cursor()

        # 1. Crear tabla
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Limpiar datos existentes
        cursor.execute("TRUNCATE TABLE users CASCADE;")

        # 3. Insertar registros unificados
        insert_query = "INSERT INTO users (id, name, email, password_hash) VALUES (%s, %s, %s, %s);"
        cursor.executemany(insert_query, USERS_SQL_DATA)

        conn.commit()
        cursor.close()
        conn.close()
        print("✅ PostgreSQL se sincronizó correctamente con 16 usuarios.")
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")


def seed_mongodb():
    print("\n--- [2/3] Inicializando MongoDB ---")
    try:
        client = MongoClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        collection = db[MONGO_COLLECTION]

        # 1. Limpiar la colección de perfiles
        collection.delete_many({})

        # 2. Insertar los documentos hidratados con las URLs públicas
        result = collection.insert_many(MONGO_PROFILES_DATA)
        
        client.close()
        print(f"✅ MongoDB poblado con éxito. {len(result.inserted_ids)} perfiles con URLs estables guardados.")
    except Exception as e:
        print(f"❌ Error en MongoDB: {e}")


def seed_neo4j():
    print("\n--- [3/3] Inicializando Neo4j ---")
    try:
        with GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)) as driver:
            with driver.session() as session:
                session.run(NEO4J_CYPHER_SEED)
        print("✅ Neo4j inicializado. Nodos creados, intereses mapeados y Likes de prueba activos (0 Matches iniciales).")
    except Exception as e:
        print(f"❌ Error en Neo4j: {e}")


# ==========================================
# EJECUCIÓN PRINCIPAL
# ==========================================

def run_all_seeds():
    print("====================================================")
    print("     EJECUTANDO SCRIPT MAESTRO DE INICIALIZACIÓN     ")
    print("====================================================")
    
    seed_postgresql()
    seed_mongodb()
    seed_neo4j()
    
    print("\n🚀 ¡Sincronización completa! Todo tu ecosistema de bases de datos está listo para pruebas.")
    print("====================================================")

if __name__ == "__main__":
    run_all_seeds()