const express = require("express")
const Tipo_Centro = require("../models/tipo_centro")
const router = express.Router()
const { validarAutorizacion, validarNivel } = require('../utilities/utilidades')

// LISTAR TODOS LOS TIPOS DE CENTROS
router.get('/', async (req, res)=>{
  try {
    const tiposCentros = await Tipo_Centro.find()
    return res.status(200).json(tiposCentros)
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
})

// REGISTRAR UN NUEVO TIPO DE CENTRO
router.post('/registrar', validarAutorizacion, validarNivel(2), async (req, res)=>{
  const tipoCentro = new Tipo_Centro({
    nombre: req.body.nombre,
    activo: true
  })

  try {
    await tipoCentro.save()
    return res.status(200).json({ 
      mensaje: `Tipo de centro "${req.body.nombre}" registrado correctamente` })
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
})


// HABILITAR/DESHABILITAR TIPO DE CENTRO
router.post('/habilitacion/:idtipocentro', validarAutorizacion, validarNivel(2), obtenerTipoCentroID, async (req,res)=>{
  res.tipoCentro.activo = !res.tipoCentro.activo
  try {
    const tipoCentroActualizado = await res.tipoCentro.save()
    let mensajeHabilitacion = "deshabilitado"
    if(tipoCentroActualizado.activo) mensajeHabilitacion = "habilitado"
    return res.status(200).json({ 
      mensaje: `Tipo de centro "${tipoCentroActualizado.nombre}" ${mensajeHabilitacion}` })
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
})

// OBTIENE UN TIPO DE CENTRO POR ID
async function obtenerTipoCentroID(req, res, next) {
  let tipoCentro
  try {
    tipoCentro = await Tipo_Centro.findOne({_id: req.params.idtipocentro})

    if(tipoCentro == null) {
      return res.status(200).json({ mensaje: "No se pudo encontrar el tipo de Centro" })
    }
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
    next()
  }

  res.tipoCentro = tipoCentro
  next()
}

module.exports = router