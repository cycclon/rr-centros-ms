const mongoose = require('mongoose')

const esquemaTipoCentro = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 64
  },
  activo: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model('TipoCentro', esquemaTipoCentro)