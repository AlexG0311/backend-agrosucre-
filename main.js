import express from 'express'
import cors from 'cors'
import { InfluxDBClient } from '@influxdata/influxdb3-client'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3000

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
}
app.use(cors(corsOptions))

// Configuración de InfluxDB
const client = new InfluxDBClient({
  host: "https://us-east-1-1.aws.cloud2.influxdata.com",
  token: process.env.INFLUX_TOKEN
})

// Consultar sensores
app.get('/sensores', async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM sensores
      WHERE time >= now() - INTERVAL '5 day'
    `
    const rows = []
    const result = client.query(sql, "Estacion")
    for await (const row of result) {
      rows.push(row)
    }
    res.json(rows)
  } catch (error) {
    console.error("Error:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})