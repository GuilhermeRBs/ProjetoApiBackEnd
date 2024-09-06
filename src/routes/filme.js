require('dotenv').config()
const express = require('express')
const router = express.Router()
const Filme = require('../models/Filme')

const Auth = require('../helpers/Auth')
const Admin = require('../helpers/Admin')


router.get('/',  Auth.checkToken, async (req, res) => {
    const { limite = 10, pagina = 1 } = req.query;
    
    try{
    
    const filmes = await Filme.find().limit(parseInt(limite)).skip((pagina - 1) * limite)
    //const user = await User.find().select("-password")

    res.status(200).json({ filmes }) 

}catch (error){
    return res.status(404).json({msg: 'Erro ao listar filmes!'})
}
})

router.post('/filme/create', Auth.checkToken, async (req, res) => {
    
    const {Title, description, lancamento, trailerUrl} = req.body
    
    if (!Title){
        return res.status(422).json({msg: 'O titulo é obrigatório!' })
    }

    if (!description){
        return res.status(422).json({msg: 'A descrição é obrigatória!' })
    }

    if (!lancamento){
        return res.status(422).json({msg: 'A data de lançamento é obrigatória!' })
    }

    if(!trailerUrl){
        return res.status(422).json({msg: 'O trailer é obrigatório!' })
    }

    const filme = new Filme({
        Title,
        description,
        lancamento,
        trailerUrl
    })
    await filme.save()
    return res.send(filme)
})

router.put('/filme/:id', Auth.checkToken, async (req, res) => {
    const filme = await Filme.findByIdAndUpdate(req.params.id, {
        Title: req.body.Title,
        description: req.body.description,
        lancamento: req.body.lancamento,
        trailerUrl: req.body.trailerurl
    })
    return res.send(filme)

})

router.delete('/filme/:id', Admin.checkAdm, async (req,res) =>{
    
    const filme = await Filme.findByIdAndDelete(req.params.id)
    return res.status(200).json({ filme, msg:'Filme deletado'})
})

module.exports = router