const mongoose = require('mongoose')

const esquemaTipoCentro = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 64,
    index: {
      unique: true
    },
  },
  activo: {
    type: Boolean,
    required: true
  }
}, { versionKey: false })

module.exports = mongoose.model('TipoCentro', esquemaTipoCentro)