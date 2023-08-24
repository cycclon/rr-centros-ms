const express = require("express")
const Centro = require("../models/centro")
const Tipo_Centro = require("../models/tipo_centro")
const router = express.Router()
const jwt = require('jsonwebtoken')

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

// OBTENER TODOS LOS CENTROS
router.get('/', async (req, res)=>{
  try {
    const centros = await Centro.find()
    return res.status(200).json(centros)
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
})

// OBTENER CENTROS POR TIPO
router.get('/tipo/:tipo', async (req, res)=>{
  try {
    const centros = await Centro.find( {tipo: req.params.tipo} )
    return res.status(200).json(centros)
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }  
})

// REGISTRAR NUEVO CENTRO
router.post('/registrar', validarAutorizacion, async (req, res)=>{
  // VALIDAR NIVEL DE ACCESO  
  const validacion = validarNivel(res.usuarioSolicitante, 2)
  if(!validacion.autorizado) {
    return res.status(200).json(validacion)
  }  

  // VALIDAR QUE EL TIPO DE CENTRO EXISTA Y ESTÉ HABILITADO
  if(! await validarTipoCentro(req.body.tipo)) return res.status(200).json({ 
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
    return res.status(200).json({ mensaje: `Centro ${req.body.nombre} registrado exitosamente.` })
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
})

// MODIFICAR CENTRO (nombre, direccion, coordenadas, encargados, tipo, activo)
async function modificarCentro(centroModificado, res){
  // VALIDAR NIVEL DE ACCESO
  const validacion = validarNivel(res.usuarioSolicitante, 2) 
  if(!validacion.autorizado) {
    return res.status(200).json(validacion)
  }

  try {
    await centroModificado.save()
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
}

// MODIFICAR TIPO DE CENTRO
router.post('/editar-tipo/:idcentro', validarAutorizacion, obtenerCentroID, async (req, res)=>{
  // VALIDAR QUE EL NUEVO TIPO ASIGNADO EXISTA Y ESTE HABILITADO
  if(! await validarTipoCentro(req.body.tipo)) return res.status(200).json({ 
    mensaje: `El tipo de centro ${req.body.tipo} es inexistente o se encuentra deshabilitado.`
  })

  res.centro.tipo = req.body.tipo
  await modificarCentro(res.centro, res)
  return res.status(200).json({ mensaje: `Se cambió a ${res.centro.tipo} el tipo del centro ${res.centro.nombre}`})
})

// MODIFICAR ENCARGADOS
router.post('/editar-encargados/:idcentro', validarAutorizacion, obtenerCentroID, async (req, res)=>{
  res.centro.encargados = req.body.encargados
  await modificarCentro(res.centro, res)
  return res.status(200).json({ mensaje: `Se modificaron el/los encargado/s del centro ${res.centro.nombre}`})
})

// MODIFICAR COORDENADAS
router.post('/editar-coordenadas/:idcentro', validarAutorizacion, obtenerCentroID, async (req, res)=>{
  res.centro.coordenadas = req.body.coordenadas
  await modificarCentro(res.centro, res)
  return res.status(200).json({ mensaje: `Se modificaron las coordenadas del centro ${res.centro.nombre}`})
})

// MODIFICAR DIRECCION
router.post('/editar-direccion/:idcentro', validarAutorizacion, obtenerCentroID, async (req, res)=>{
  res.centro.direccion = req.body.direccion
  await modificarCentro(res.centro, res)
  return res.status(200).json({ mensaje: `Se modificó la dirección del centro ${res.centro.nombre}`})
})

// MODIFICAR NOMBRE
router.post('/editar-nombre/:idcentro', validarAutorizacion, obtenerCentroID, async (req, res)=>{
  res.centro.nombre = req.body.nombre
  await modificarCentro(res.centro, res)
  return res.status(200).json({ mensaje: `Se modificó el nombre del centro correctamente`})
})

// HABILITAR/DESHABILITAR CENTRO
router.post('/habilitacion/:idcentro', validarAutorizacion, obtenerCentroID, async (req,res)=>{
    res.centro.activo = !res.centro.activo
  try {
    await modificarCentro(res.centro, res)
    let mensajeHabilitacion = "deshabilitado"
    if(res.centro.activo) mensajeHabilitacion = "habilitado"
    return res.status(200).json({ 
      mensaje: `Centro "${res.centro.nombre}" ${mensajeHabilitacion}` })
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
  }
})

// OBTIENE UN CENTRO POR ID
async function obtenerCentroID(req, res, next) {
  let centro
  try {
    centro = await Centro.findOne({ _id: req.params.idcentro })

    if(centro == null) {
      return res.status(200).json({ mensaje: "No se pudo encontrar el tipo de Centro" })
    }
  } catch (error) {
    return res.status(200).json({ mensaje: error.message })
    next()
  }

  res.centro = centro
  next()
}

// VALIDAR TIPO DE CENTRO
async function validarTipoCentro(tipo) {
  const tiposCentros = await Tipo_Centro.find({ activo: true })
  return tiposCentros.find(tc => tc.nombre === tipo)
}

// VALIDAR TOKEN JWT
function validarAutorizacion(req, res, next) {  
  const encabezadoAut = req.headers['authorization']

  const token = encabezadoAut && encabezadoAut.split(' ')[1]
  
  if(token == null) return res.status(201).json({ autorizado: false })

  jwt.verify(token, process.env.JWT_KEY, (err, usuario)=>{
      if(err) return res.status(201).json({ autorizado: false, motivo: err.message })

      // USUARIO QUE SOLICITA LA FUNCIONALIDAD A LA API
      res.usuarioSolicitante = usuario
      next()
  })
}

module.exports = router