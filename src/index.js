require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

const User = require('./models/User')
const Filme = require('./models/Filme')
const Auth = require('./helpers/Auth')
const Admin = require('./helpers/Admin')

LoginRouter = require('./routes/login')
app.use('/', LoginRouter)

installRouter = require('./routes/install')
app.use('/', installRouter)

// Credenciais BD
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

const port = 3000

 
// Rota privada
app.get("/user/:id", Auth.checkToken, Admin.checkAdm, async (req, res) => {

    const id = req.params.id
 
    const user = await User.findById(id, '-password')

    if(!user) {
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }
    
    res.status(200).json({ user }) 
})
// Rota privada de deletar usuário
app.delete("/user/admin/:id", Auth.checkToken, Admin.checkAdm, async (req, res) => {
 
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
//Rota para alterar dados do User
app.put("/user/:id", Auth.checkToken, async (req, res) => {

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

//Registrar admin
app.post("/auth/user/admin", Auth.checkToken, Admin.checkAdm, async (req, res) => {
    
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


//Registrar usuario
app.post('/auth/register', async(req, res) => {

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


app.listen(port, () => {
    console.log(`listening on port ${port}`)
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@backend-api.3thusvv.mongodb.net/?retryWrites=true&w=majority&appName=backend-api`)
    .then(() => {

    }).catch((err) => console.log(err))
})


app.get('/', async (req, res) => {
    const { limite = 10, pagina = 1 } = req.query;
    
    try{
    
    const filmes = await Filme.find().limit(parseInt(limite)).skip((pagina - 1) * limite)
    //const user = await User.find().select("-password")

    res.status(200).json({ filmes }) 

}catch (error){
    return res.status(404).json({msg: 'Erro ao listar filmes!'})
}
})


app.post('/filme/create', Auth.checkToken, async (req, res) => {
    const filme = new Filme({
        Title: req.body.Title,
        description: req.body.description,
        lancamento: req.body.lancamento,
        trailerUrl: req.body.trailerUrl
    })
    await filme.save()
    return res.send(filme)
})

app.put('/filme/:id', Auth.checkToken, async (req, res) => {
    const filme = await Filme.findByIdAndUpdate(req.params.id, {
        Title: req.body.Title,
        description: req.body.description,
        lancamento: req.body.lancamento,
        trailerUrl: req.body.trailerurl
    })
    return res.send(filme)

})

app.delete('/filme/:id', Auth.checkToken, Admin.checkAdm, async (req,res) =>{
    
    const filme = await Filme.findByIdAndDelete(req.params.id)
    return res.status(200).json({ filme, msg:'Filme deletado'})
})




  
