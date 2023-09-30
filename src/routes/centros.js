const express = require("express")
const Centro = require("../models/centro")
const Tipo_Centro = require("../models/tipo_centro")
const router = express.Router()
const { validarAutorizacion, validarNivel } = require("../utilities/utilidades")

// OBTENER TODOS LOS CENTROS
router.get('/', async (req, res)=>{
  try {
    const centros = await Centro.find()
    return res.status(200).json(centros)
  } catch (error) {
    return res.status(200).json({ error: 2, mensaje: error.message })
  }
})

// OBTENER CENTROS POR TIPO
router.get('/tipo/:tipo', async (req, res)=>{
  try {
    const centros = await Centro.find( {tipo: req.params.tipo} )
    return res.status(200).json(centros)
  } catch (error) {
    return res.status(200).json({ error: 2, mensaje: error.message })
  }  
})

// REGISTRAR NUEVO CENTRO
router.post('/registrar', validarAutorizacion, validarNivel(2), async (req, res)=>{

  // VALIDAR QUE EL TIPO DE CENTRO EXISTA Y ESTÉ HABILITADO
  if(! await validarTipoCentro(req.body.tipo)) return res.status(200).json({ error: 1, 
    mensaje: `El tipo de centro ${req.body.tipo} es inexistente o se encuentra deshabilitado.`
  })

  try {
    const centro = new Centro({
      nombre: req.body.nombre,
      direccion: req.body.direccion,
      coordenadas: req.body.coordenadas,
      encargados: req.body.encargados,
      tipo: req.body.tipo,
      activo: true
    })

    await centro.save()
    return res.status(200).json({ error: 0, mensaje: `Centro ${req.body.nombre} registrado exitosamente.` })
  } catch (error) {
    return res.status(200).json({ error: 2, mensaje: error.message })
  }
})

// MODIFICAR CENTRO (nombre, direccion, coordenadas, encargados, tipo, activo)
async function modificarCentro(centroModificado, res){
  try {
    await centroModificado.save()
  } catch (error) {
    return res.status(200).json({ error: 2, mensaje: error.message })
  }
}

// MODIFICAR TIPO DE CENTRO
router.post('/editar-tipo/:idcentro', validarAutorizacion, validarNivel(2), obtenerCentroID, async (req, res)=>{
  // VALIDAR QUE EL NUEVO TIPO ASIGNADO EXISTA Y ESTE HABILITADO
  if(! await validarTipoCentro(req.body.tipo)) return res.status(200).json({ error: 1,
    mensaje: `El tipo de centro ${req.body.tipo} es inexistente o se encuentra deshabilitado.`
  })

  res.centro.tipo = req.body.tipo
  await modificarCentro(res.centro, res)
  return res.status(200).json({ error: 0, 
    mensaje: `Se cambió a ${res.centro.tipo} el tipo del centro ${res.centro.nombre}`})
})

// MODIFICAR ENCARGADOS
router.post('/editar-encargados/:idcentro', validarAutorizacion, validarNivel(2), obtenerCentroID, async (req, res)=>{
  res.centro.encargados = req.body.encargados
  await modificarCentro(res.centro, res)
  return res.status(200).json({ error: 0, 
    mensaje: `Se modificaron el/los encargado/s del centro ${res.centro.nombre}`})
})

// MODIFICAR COORDENADAS
router.post('/editar-coordenadas/:idcentro', validarAutorizacion, validarNivel(2), obtenerCentroID, async (req, res)=>{
  res.centro.coordenadas = req.body.coordenadas
  await modificarCentro(res.centro, res)
  return res.status(200).json({ error: 0,
    mensaje: `Se modificaron las coordenadas del centro ${res.centro.nombre}`})
})

// MODIFICAR DIRECCION
router.post('/editar-direccion/:idcentro', validarAutorizacion, validarNivel(2), obtenerCentroID, async (req, res)=>{
  res.centro.direccion = req.body.direccion
  await modificarCentro(res.centro, res)
  return res.status(200).json({ error: 0, mensaje: `Se modificó la dirección del centro ${res.centro.nombre}`})
})

// MODIFICAR NOMBRE
router.post('/editar-nombre/:idcentro', validarAutorizacion, validarNivel(2), obtenerCentroID, async (req, res)=>{
  res.centro.nombre = req.body.nombre
  await modificarCentro(res.centro, res)
  return res.status(200).json({ error: 0, mensaje: `Se modificó el nombre del centro correctamente`})
})

// HABILITAR/DESHABILITAR CENTRO
router.post('/habilitacion/:idcentro', validarAutorizacion, validarNivel(2), obtenerCentroID, async (req,res)=>{
  res.centro.activo = !res.centro.activo
  try {
    await modificarCentro(res.centro, res)
    let mensajeHabilitacion = "deshabilitado"
    if(res.centro.activo) mensajeHabilitacion = "habilitado"
    return res.status(200).json({ error: 0,
      mensaje: `Centro "${res.centro.nombre}" ${mensajeHabilitacion}` })
  } catch (error) {
    return res.status(200).json({ error: 2, mensaje: error.message })
  }
})

// OBTIENE UN CENTRO POR ID
async function obtenerCentroID(req, res, next) {
  let centro
  try {
    centro = await Centro.findOne({ _id: req.params.idcentro })

    if(centro == null) {
      return res.status(200).json({ error: 1,
         mensaje: "No se pudo encontrar el tipo de Centro" })
    }
  } catch (error) {
    return res.status(200).json({ error: 2,
      mensaje: error.message })
  }

  res.centro = centro
  next()
}

// VALIDAR TIPO DE CENTRO
async function validarTipoCentro(tipo) {
  const tiposCentros = await Tipo_Centro.find({ activo: true })
  return tiposCentros.find(tc => tc.nombre === tipo)
}

module.exports = router