const neo4j = require('neo4j-driver');
const cassandra = require('cassandra-driver');

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Datos maestros para mapear Neo4j y Cassandra
const users = [
    { id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'Miguel' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'Federico' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000003', name: 'Santiago' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000004', name: 'Andres' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000005', name: 'Laura' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000006', name: 'Valentina' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000007', name: 'Camila' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000008', name: 'Lucia' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000009', name: 'Florencia' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000010', name: 'Micaela' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000011', name: 'Carlos' },
    { id: 'a1b2c3d4-0000-0000-0000-000000000012', name: 'Sofia' }
];

async function seedNeo4j() {
    console.log("⏳ Conectando a Neo4j...");
    let driver;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password123'));
            await driver.verifyConnectivity();
            console.log("✅ Neo4j listo. Sembrando nodos y relaciones...");
            
            const session = driver.session();

            // 1. Crear Nodos
            for (const user of users) {
                await session.run(`MERGE (u:User {userId: $id}) ON CREATE SET u.name = $name`, user);
            }

            // 2. Crear Relaciones (Simulando uso de la app)
            // Laura le da LIKE a Federico
            await session.run(`MATCH (u1:User {userId: 'a1b2c3d4-0000-0000-0000-000000000005'}), (u2:User {userId: 'a1b2c3d4-0000-0000-0000-000000000002'}) MERGE (u1)-[:LIKES {timestamp: datetime()}]->(u2)`);
            // Federico le da LIKE a Laura (MATCH!)
            await session.run(`MATCH (u1:User {userId: 'a1b2c3d4-0000-0000-0000-000000000002'}), (u2:User {userId: 'a1b2c3d4-0000-0000-0000-000000000005'}) MERGE (u1)-[:MATCHES {timestamp: datetime()}]-(u2)`);
            
            // Miguel le da LIKE a Valentina
            await session.run(`MATCH (u1:User {userId: 'a1b2c3d4-0000-0000-0000-000000000001'}), (u2:User {userId: 'a1b2c3d4-0000-0000-0000-000000000006'}) MERGE (u1)-[:LIKES {timestamp: datetime()}]->(u2)`);
            // Santiago DESCARTA (PASS) a Carlos
            await session.run(`MATCH (u1:User {userId: 'a1b2c3d4-0000-0000-0000-000000000003'}), (u2:User {userId: 'a1b2c3d4-0000-0000-0000-000000000011'}) MERGE (u1)-[:PASSED {timestamp: datetime()}]->(u2)`);
            
            await session.close();
            console.log("🌱 Neo4j sembrado.");
            return;
        } catch (error) {
            console.log(`⚠️ Neo4j no responde. Reintentando...`);
            await sleep(RETRY_DELAY_MS);
        }
    }
}

async function seedCassandra() {
    console.log("⏳ Conectando a Cassandra...");
    const client = new cassandra.Client({ contactPoints: ['localhost:9042'], localDataCenter: 'datacenter1' });

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await client.connect();
            console.log("✅ Cassandra lista. Configurando tablas...");
            
            await client.execute(`CREATE KEYSPACE IF NOT EXISTS tinderlike WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}`);
            await client.execute(`
                CREATE TABLE IF NOT EXISTS tinderlike.swipe_history (
                    user_id uuid,
                    target_id uuid,
                    action text,
                    created_at timestamp,
                    PRIMARY KEY (user_id, created_at)
                ) WITH CLUSTERING ORDER BY (created_at DESC);
            `);
            
            // Insertar logs del historial equivalentes a lo que hicimos en Neo4j
            const queries = [
                { query: `INSERT INTO tinderlike.swipe_history (user_id, target_id, action, created_at) VALUES (?, ?, ?, toTimestamp(now()))`, params: ['a1b2c3d4-0000-0000-0000-000000000005', 'a1b2c3d4-0000-0000-0000-000000000002', 'LIKE'] },
                { query: `INSERT INTO tinderlike.swipe_history (user_id, target_id, action, created_at) VALUES (?, ?, ?, toTimestamp(now()))`, params: ['a1b2c3d4-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000005', 'LIKE'] },
                { query: `INSERT INTO tinderlike.swipe_history (user_id, target_id, action, created_at) VALUES (?, ?, ?, toTimestamp(now()))`, params: ['a1b2c3d4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000006', 'LIKE'] },
                { query: `INSERT INTO tinderlike.swipe_history (user_id, target_id, action, created_at) VALUES (?, ?, ?, toTimestamp(now()))`, params: ['a1b2c3d4-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000011', 'PASS'] }
            ];

            // Ejecutamos las inserciones
            for (const q of queries) {
                await client.execute(q.query, q.params, { prepare: true });
            }

            console.log("🌱 Cassandra sembrada.");
            return;
        } catch (error) {
            console.log(`⚠️ Cassandra no responde. Reintentando...`);
            await sleep(RETRY_DELAY_MS);
        }
    }
}

async function runAllSeeds() {
    await Promise.all([seedNeo4j(), seedCassandra()]);
    console.log("🎉 Todas las bases de datos han sido sembradas y están sincronizadas con los mismos UUIDs.");
    process.exit(0);
}

runAllSeeds();