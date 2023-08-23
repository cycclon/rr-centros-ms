const express = require("express")
const Centro = require("../models/centro")
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
    mensaje: `El tipo de centro ${req.body.tipo} es inexistente o se encuentra deshabilitado.` })

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

// VALIDAR TIPO DE CENTRO
async function validarTipoCentro(tipo) {
  const tiposCentros = await Tipo_Centro.find({ activo: true })
  return tiposCentros.find(tc => tc.nombre === tipo)
}

// VALIDAR TOKEN JWT
function validarAutorizacion(req, res, next) {  
  res.usuarioSolicitante = { nombre: "test", tipo: 2 }
  next()
}

module.exports = router