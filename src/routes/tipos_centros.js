const express = require("express")
const Tipo_Centro = require("../models/tipo_centro")
const router = express.Router()

// FUNCIÓN PARA VALIDAR EL NIVEL DE ACCESO DE UN USUARIO SOLICITANTE
function validarNivel(usuario, nivelRequerido) {
  const resultado = {
    autorizado: false, 
    motivo: 'Nivel de acceso insuficiente', 
    nivelRequerido: nivelRequerido, 
    nivel: usuario.tipo
  }
  if(usuario.tipo <= nivelRequerido) {    
    resultado.autorizado = true
    resultado.motivo = 'Autorizado'
  }

  return resultado
}

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
router.post('/registrar', validarAutorizacion, async (req, res)=>{
  // VALIDAR NIVEL DE ACCESO
  const validacion = validarNivel(res.usuarioSolicitante, 2)
  if(!validacion.autorizado) {
    return res.status(200).json(validacion)
  }

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
router.post('/habilitacion/:idtipocentro', validarAutorizacion, obtenerTipoCentroID, async (req,res)=>{
  // VALIDAR NIVEL DE ACCESO
  const validacion = validarNivel(res.usuarioSolicitante, 2) 
  if(!validacion.autorizado) {
    return res.status(200).json(validacion)
  }

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

// VALIDAR TOKEN JWT
function validarAutorizacion(req, res, next) {
  res.usuarioSolicitante = { nombre: "test", tipo: 2 }
  next()
}

module.exports = router