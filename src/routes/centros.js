const express = require("express")
const Centro = require("../models/centro")
const router = express.Router()

router.get('/', async (req, res)=>{
  try {
    const centros = await Centro.find()
    res.send(centros)
  } catch (error) {
    res.send({ mensaje: error.message })
  }
})

module.exports = router