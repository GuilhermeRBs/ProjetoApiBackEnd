require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

const User = require('../models/User')

const Auth = require('../helpers/Auth')
const Admin = require('../helpers/Admin')



//Registrar usuario
router.post('/auth/register', async(req, res) => {

    const {name, email, password, confirmpassword} = req.body

    //validacao
    if (!name){
        return res.status(422).json({msg: 'O nome é obrigatório!' })
    }

    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório!' })
    }

    if (!password){
        return res.status(422).json({msg: 'A senha é obrigatória!' })
    }

    if(password !== confirmpassword){
        return res.status(422).json({msg: 'As senhas não conferem!' })
    }

    //Check user existe
    const userExists = await User.findOne({ email: email})

    if (userExists) {
        return res.status(422).json({msg: 'Email já cadastrado!' })   
    }

    //Encriptografando senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //criando user
    const user = new User({
        name,
        email,
        password: passwordHash,
        isAdmin: false
    })

    await user.save()
    res.status(200).send(user)
})

//Rota para alterar dados do User
router.put("/user/:id", Auth.checkToken, async (req, res) => {

    const userId = req.params.id

    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Você não pode alterar esse usuário!' });
      }
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    
        if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
    
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao atualizar dados!' });
    }

})

// Rota privada - retorna todos os usuários
router.get('/user/', Auth.checkToken, Admin.checkAdm,async (req, res) => {
    const { limite = 10, pagina = 1 } = req.query;
    
    try{
    
    const user = await User.find().limit(parseInt(limite)).skip((pagina - 1) * limite).select("-password")

    res.status(200).json({ user }) 

}catch (error){
    return res.status(404).json({msg: 'Erro ao listar usuários!'})
}
})

// Rota privada por ID
router.get("/user/:id", Auth.checkToken, Admin.checkAdm, async (req, res) => {

    const id = req.params.id
 
    const user = await User.findById(id, '-password')

    if(!user) {
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }
    
    res.status(200).json({ user }) 
})

// Rota privada de deletar usuário
router.delete("/user/admin/:id", Auth.checkToken, Admin.checkAdm, async (req, res) => {
 
    const id = req.params.id

    const user = await User.findById(id)
    if(!user){
        return res.status(422).json({msg: 'Usuário não encontrado'})
    }
    if(user.isAdmin == true){
        return res.status(422).json({msg: 'Não é possível deletar um Admin'})
    }
    await User.findByIdAndDelete(id)
    return res.status(200).json({msg:'Usuário deletado com sucesso!'})

})

//Registrar admin
router.post("/user/admin", Auth.checkToken, Admin.checkAdm, async (req, res) => {
    
    const {name, email, password, confirmpassword} = req.body

    //validacao
    if (!name){
        return res.status(422).json({msg: 'O nome é obrigatório!' })
    }
    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório!' })
    }
    if (!password){
        return res.status(422).json({msg: 'A senha é obrigatória!' })
    }
    if(password !== confirmpassword){
        return res.status(422).json({msg: 'As senhas não conferem!' })
    }

    //Check user existe
    const userExists = await User.findOne({ email: email})

    if (userExists) {
        return res.status(422).json({msg: 'Email já cadastrado!' })   
    }

    //Encriptografando senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //criando usuário Admin
    const user = new User({
        name,
        email,
        password: passwordHash,
        isAdmin: true
    })
    await user.save()
    res.status(200).send(user)
})




module.exports = router