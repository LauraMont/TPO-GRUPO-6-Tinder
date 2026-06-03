db = db.getSiblingDB('tinderlike_db');

if (!db.getUser('testuser')) {
  db.createUser({
    user: 'testuser',
    pwd: 'abc123',
    roles: [{ role: 'readWrite', db: 'tinderlike_db' }]
  });
}

// Limpiar la colección por si ejecutamos el script varias veces
db.profiles.drop();

db.profiles.insertMany([
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000001",
    name: "Miguel",
    age: 26,
    bio: "Experto en bases de datos relacionales y seguridad. Si logras hackear mi corazón, te invito un café ☕",
    interests: ["PostgreSQL", "Ciberseguridad", "Tecnología", "Café"],
    photos: ["foto_miguel_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000002",
    name: "Federico",
    age: 25,
    bio: "Amante del código limpio y las bases de datos documentales. Siempre dispuesto a una buena charla sobre arquitectura.",
    interests: ["MongoDB", "Arquitectura", "Música Indie"],
    photos: ["foto_fede_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000003",
    name: "Santiago",
    age: 24,
    bio: "Vivo la vida en tiempo real y sin latencia. Fanático del alto rendimiento y los deportes.",
    interests: ["Redis", "WebSockets", "Fútbol", "Gaming"],
    photos: ["foto_santi_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000004",
    name: "Andres",
    age: 27,
    bio: "Almaceno buenos momentos a nivel masivo. Me encanta la naturaleza y la fotografía.",
    interests: ["Cassandra", "Fotografía", "Senderismo"],
    photos: ["foto_andres_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000005",
    name: "Laura",
    age: 23,
    bio: "Trazando conexiones y diseñando experiencias. Buscando a alguien que sea el nodo perfecto en mi grafo.",
    interests: ["Neo4j", "UX/UI Design", "Arte", "Viajes"],
    photos: ["foto_laura_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000006",
    name: "Valentina",
    age: 25,
    bio: "Arquitecta en la UBA. Amo recorrer la ciudad buscando cafeterías de especialidad.",
    interests: ["Arquitectura", "Café", "Fotografía"],
    photos: ["foto_vale_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000007",
    name: "Camila",
    age: 24,
    bio: "Estudiante de veterinaria. Tengo dos perros que son mi vida 🐶",
    interests: ["Animales", "Naturaleza", "Series"],
    photos: ["foto_cami_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000008",
    name: "Lucia",
    age: 26,
    bio: "Cinéfila empedernida. Siempre lista para un maratón de películas los domingos.",
    interests: ["Cine", "Literatura", "Música"],
    photos: ["foto_lucia_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000009",
    name: "Florencia",
    age: 22,
    bio: "Bailarina y estudiante de artes. Buscando gente copada para salir a bailar.",
    interests: ["Danza", "Fiestas", "Arte"],
    photos: ["foto_flor_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000010",
    name: "Micaela",
    age: 28,
    bio: "Chef profesional. Te puedo conquistar por el estómago 🍝",
    interests: ["Gastronomía", "Vinos", "Viajes"],
    photos: ["foto_mica_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000011",
    name: "Carlos",
    age: 29,
    bio: "Ingeniero de software. Fanático del asado de los domingos.",
    interests: ["Tecnología", "Asado", "Fútbol"],
    photos: ["foto_carlos_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000012",
    name: "Sofia",
    age: 24,
    bio: "Diseñadora gráfica. Me encanta probar cosas nuevas y salir de mi zona de confort.",
    interests: ["Diseño", "Aventuras", "Pintura"],
    photos: ["foto_sofia_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000013",
    name: "Nicolas",
    age: 27,
    bio: "Desarrollador backend y fanático del café fuerte. Siempre buscando el próximo proyecto.",
    interests: ["Backend", "Café", "Arquitectura"],
    photos: ["foto_nico_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000014",
    name: "Paula",
    age: 23,
    bio: "Estudiante de diseño y fotógrafa amateur. Me gustan los planes tranquilos y las charlas largas.",
    interests: ["Diseño", "Fotografía", "Libros"],
    photos: ["foto_paula_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000015",
    name: "Julian",
    age: 30,
    bio: "Ingeniero de datos, runner y amante de la tecnología. Si hay una montaña, quiero subirla.",
    interests: ["Data", "Running", "Tecnología"],
    photos: ["foto_julian_1.jpg"]
  },
  {
    userId: "a1b2c3d4-0000-0000-0000-000000000016",
    name: "Mara",
    age: 26,
    bio: "Profesora de inglés y fan de los viajes improvisados. Busco alguien con buen humor.",
    interests: ["Viajes", "Idiomas", "Música"],
    photos: ["foto_mara_1.jpg"]
  }
]);