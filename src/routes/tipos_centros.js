const express = require("express")
const Tipo_Centro = require("../models/tipo_centro")
const router = express.Router()

router.get('/tipos-centros', async (req, res)=>{
  try {
    const tiposCentros = await Tipo_Centro.find()
    res.send(tiposCentros)
  } catch (error) {
    res.send({ mensaje: error.message })
  }
})

module.exports = router