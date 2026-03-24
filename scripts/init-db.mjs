/**
 * Script de inicialización de la base de datos Turso.
 * Crea las tablas necesarias e inserta las predicciones por defecto.
 *
 * INSTRUCCIONES:
 *   Desde la carpeta raíz del proyecto, ejecuta:
 *   node scripts/init-db.mjs
 */

import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')

let TURSO_DATABASE_URL = '', TURSO_AUTH_TOKEN = ''

try {
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    const val = line.slice(eqIdx + 1).trim()
    if (key === 'TURSO_DATABASE_URL') TURSO_DATABASE_URL = val
    if (key === 'TURSO_AUTH_TOKEN')   TURSO_AUTH_TOKEN   = val
  }
} catch {
  console.error('❌ No se encontró el archivo .env en la raíz del proyecto')
  process.exit(1)
}

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en el .env')
  process.exit(1)
}

const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
})

const COMBATS = [
  { id: '1-edu-aguirre-vs-gaston-edul',   fighters: ['edu-aguirre', 'gaston-edul'] },
  { id: '2-fabiana-sevillano-vs-la-parce', fighters: ['fabiana-sevillano', 'la-parce'] },
  { id: '3-clersss-vs-natalia-mx',         fighters: ['clersss', 'natalia-mx'] },
  { id: '4-kidd-keo-vs-lit-killah',        fighters: ['kidd-keo', 'lit-killah'] },
  { id: '5-alondrissa-vs-angie-velasco',   fighters: ['alondrissa', 'angie-velasco'] },
  { id: '6-gero-arias-vs-viruzz',          fighters: ['gero-arias', 'viruzz'] },
  { id: '7-roro-vs-samy-rivers',           fighters: ['roro', 'samy-rivers'] },
  { id: '8-marta-diaz-vs-tatiana-kaer',    fighters: ['marta-diaz', 'tatiana-kaer'] },
  { id: '9-yosoyplex-vs-fernanfloo',       fighters: ['yosoyplex', 'fernanfloo'] },
  { id: '10-illojuan-vs-grefg',            fighters: ['illojuan', 'grefg'] },
]

async function main() {
  console.log('🚀 Conectando a Turso:', TURSO_DATABASE_URL)

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS predictions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      combat_id  TEXT    NOT NULL,
      fighter_id TEXT    NOT NULL,
      votes      INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(combat_id, fighter_id)
    )
  `)
  console.log('✅ Tabla predictions OK')

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS user_votes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      combat_id  TEXT NOT NULL,
      fighter_id TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(combat_id, user_id)
    )
  `)
  console.log('✅ Tabla user_votes OK')

  let count = 0
  for (const combat of COMBATS) {
    for (const fighterId of combat.fighters) {
      await turso.execute({
        sql: 'INSERT OR IGNORE INTO predictions (combat_id, fighter_id, votes) VALUES (?, ?, 0)',
        args: [combat.id, fighterId],
      })
      count++
    }
  }
  console.log(`✅ ${count} filas de predicciones inicializadas`)

  await turso.execute('CREATE INDEX IF NOT EXISTS idx_predictions_combat ON predictions(combat_id)')
  await turso.execute('CREATE INDEX IF NOT EXISTS idx_user_votes ON user_votes(combat_id, user_id)')
  console.log('✅ Índices creados')

  turso.close()
  console.log('\n🎉 ¡Base de datos lista! Reinicia el servidor de desarrollo.')
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
