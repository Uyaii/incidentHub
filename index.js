import express from 'express'
import cors  from 'cors'
import dotenv from 'dotenv'
import healthRoute from "./routes/health.js";


const app = express()
app.use(express.json())
app.use(cors())
dotenv.config()


const startServer = ()=>{

}


app.use('/api/health', healthRoute)