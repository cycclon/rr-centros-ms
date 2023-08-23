const mongoose = require('mongoose')

const esquemaCentro = mongoose.Schema({
    nombre: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 64
    },
    direccion: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 128
    },
    coordenadas: {
      type: String,
      required: false,
      minLength: 3,
      maxLength: 256
    },
    encargados: {
      type: Array,
      required: false,      
    },
    tipo: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 64
    },
    activo: {
      type: Boolean,
      required: true
    }
}, { versionKey: false })

module.exports = mongoose.model('Centro', esquemaCentro)