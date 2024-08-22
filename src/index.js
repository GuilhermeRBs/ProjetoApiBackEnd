require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const User = require('./models/User')
const Filme = require('./models/Filme')

const port = 3000

// Rota privada
app.get("/user/:id", checkToken, async (req, res) => {

    const id = req.params.id

    const user = await User.findById(id, '-password')

    if(!user) {
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }
    
    res.status(200).json({ user }) 
})



//Registro usuario
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
    isAdmin = false
    if (name == 'Admin' && password == 'Admin') {
        isAdmin = true
    }

    //senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //user
    const user = new User({
        name,
        email,
        password: passwordHash,
        isAdmin
    })

    await user.save()
    return res.send(user)
})

//Registro de Admin
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
    isAdmin = false
    if (name == 'Admin' && password == 'Admin') {
        isAdmin = true
    }

    //senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //user
    const user = new User({
        name,
        email,
        password: passwordHash,
        isAdmin
    })

    await user.save()
    return res.send(user)
})

// Login
app.post('/auth/login', async (req, res) =>{

    const {email, password} = req.body

    //validacao
    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório!' })
    }

    if (!password){
        return res.status(422).json({msg: 'A senha é obrigatória!' })
    }

        //Check user existe
        const user = await User.findOne({ email: email })

        if (!user) {
            return res.status(404).json({msg: 'Usuário não encontrado!' })
        }

        //Check senha igual
        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword){
            return res.status(422).json({msg: 'Senha invalida!' })
        }

    //Criação token
    try{
        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )

        res.status(200).json({msg: 'Autenticação realizada com sucesso', token})


    }catch(err){
        console.log(error)
        res.status(500).json({msg: 'Aconteceu um erro no servidor!' })
    }
})

//Checa o token
function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) {
        return res.status(401).json({msg: 'Acesso Negado!' })
    }

    try{

        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()

    }catch(error ){
        res.status(400).json({msg: 'Token inválido!'})
    }
}

// Credenciais BD
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS


app.listen(port, () => {
    console.log(`listening on port ${port}`)
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@backend-api.3thusvv.mongodb.net/?retryWrites=true&w=majority&appName=backend-api`)
    .then(() => {

    }).catch((err) => console.log(err))
})



app.get('/', async (req, res) => {
    const filmes = await Filme.find()
    return res.send(filmes)
})


app.post('/', async (req, res) => {
    const filme = new Filme({
        Title: req.body.Title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        trailerUrl: req.body.trailerUrl
    })
    await filme.save()
    return res.send(filme)
})

app.put('/:id', async (req, res) => {
    const filme = await Filme.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        trailerUrl: req.body.trailerurl
    })
    return res.send(filme)

})

app.delete('/:id', async (req,res) =>{
    const filme = await Filme.findByIdAndDelete(req.params.id)
    return res.send(filme)
})




  
