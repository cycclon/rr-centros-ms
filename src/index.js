require('dotenv').config()
const express = require('express')
const app = express()
const tiposCentroRoute = require('./routes/tipos_centros')
const CentrosRoute = require('./routes/centros')

const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

db.on('error', (error)=> console.log(error));
db.once('open',()=>console.log('Conectado a base de datos de Centros'));

app.use(express.json());
app.use(cors());

app.use('/centros', CentrosRoute)
app.use('/tipos-centros', tiposCentroRoute)

app.listen(3002, ()=> console.log('RR: microservicio de Centros iniciado correctamente en puerto 3002.'))