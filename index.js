const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL en Clever Cloud con el puerto asignado (50013)
const db = new Pool({
  host: 'bbexcavokiaib0uea35r-postgresql.services.clever-cloud.com',
  user: 'uluqvmi60lars6hkb7q8',
  password: 'ntlwvCtQb0qkzEdbInmAGMZzt24PQN',
  database: 'bbexcavokiaib0uea35r',
  port: 50013,
  ssl: { rejectUnauthorized: false }
});

// Conectar y crear la tabla automáticamente
db.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error de conexión a DB:', err.message);
  } else {
    console.log('✅ Conectado exitosamente a PostgreSQL en la nube');
    release();

    const tableSql = `CREATE TABLE IF NOT EXISTS asistencia (
      id_clase VARCHAR(50) PRIMARY KEY,
      estado VARCHAR(20) NOT NULL
    );`;

    db.query(tableSql, (err) => {
      if (!err) console.log('✅ Tabla "asistencia" lista');
      else console.error('Error creando la tabla:', err.message);
    });
  }
});

// Endpoint para guardar o actualizar el estado de una clase
app.post('/api/guardar', async (req, res) => {
  const { id_clase, estado } = req.body;
  const sql = `INSERT INTO asistencia (id_clase, estado) VALUES ($1, $2)
               ON CONFLICT (id_clase) DO UPDATE SET estado = EXCLUDED.estado`;
  
  try {
    await db.query(sql, [id_clase, estado]);
    res.send({ ok: true });
  } catch (err) {
    console.error('Error al guardar:', err);
    res.status(500).send(err);
  }
});

// Endpoint para obtener todos los estados
app.get('/api/estados', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM asistencia');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar:', err);
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));