import express from 'express'
import cors from 'cors'
import { InfluxDBClient } from '@influxdata/influxdb3-client'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Configuración de CORS
const defaultOrigins = [
  'http://localhost:5173',
  'https://dashboard-iot-one.vercel.app'
]
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []
const allowedOrigins = new Set([...defaultOrigins, ...envOrigins])

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true
  }

  const normalized = origin.endsWith('/') ? origin.slice(0, -1) : origin
  return allowedOrigins.has(normalized)
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

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