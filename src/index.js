require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//TOKEN ADMIN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2Y2U5ZDU1ZGM1MDg1OTJjOTEzMzMxYyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcyNDgxODAyNH0.LTUV-Dk_7971fom4itO_VUiAntdV34EdA_G7yY1RRJg"
const app = express()
app.use(express.json())

const User = require('./models/User')
const Filme = require('./models/Filme')
const { jwtDecode } = require('jwt-decode')

// Credenciais BD
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

const port = 3000

//Criação Admin Default
app.get("/install", async (req, res) => {
    const salt = await bcrypt.genSalt(12)
    const password = 'admin'
    const passwordHash = await bcrypt.hash(password, salt)
    const user = new User({
        name: 'Admin',
        email: 'admin@admin.com',
        password: passwordHash, 
        isAdmin: true
    })
    await user.save()

    return res.status(200).json({msg: 'Criação efetuada com sucesso!'})

})

 
// Rota privada
app.get("/user/:id", checkToken, checkAdm, async (req, res) => {

    const id = req.params.id
 
    const user = await User.findById(id, '-password')

    if(!user) {
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }
    
    res.status(200).json({ user }) 
})
// Rota privada de deletar usuário
app.delete("/user/admin/:id", checkToken, checkAdm, async (req, res) => {

    const id = req.params.id

    const user = await User.findByIdAndDelete(id)
    if(!user){
        return res.status(422).json({msg: 'Usuário não encontrado'})
    }
    return res.status(200).json({msg:'Usuário deletado com sucesso!'})

})

app.put("/user/admin/:id", checkToken, checkAdm, async (req, res) => {

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        isAdmin: req.body.isAdmin
    })

    await user.save()
    return res.status(200).json({ user }) 

})

//Registrar admin
app.post("/user/admin", checkToken, checkAdm, async (req, res) => {
    
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

//Registro de Admin
app.post('/auth/admin/register', checkToken, checkAdm, async(req, res) => {

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

    //senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //user
    const user = new User({
        name,
        email,
        password: passwordHash,
        isAdmin: true
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
            return res.status(404).json({msg: 'Usuário ou Senha invalida!' })
        }

        //Check senha igual
        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword){
            return res.status(422).json({msg: 'Usuário ou Senha invalida!' })
        }

    //Criação token
    try{
        const secret = process.env.SECRET
        const token = jwt.sign({id: user._id, isAdmin: user.isAdmin},
            secret,
        )
        const decoded = jwtDecode(token)
        

        res.status(200).json({msg: 'Autenticação realizada com sucesso', token, decoded})


    }catch(err){
        console.log('error')
        res.status(500).json({msg: 'Aconteceu um erro no servidor!' })
    }
})

//Checa o token login
function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) {
        return res.status(401).json({msg: 'Acesso Negado token!' })
    }

    try{

        const secret = process.env.SECRET

        jwt.verify(token, secret)
        next()

    }catch(error ){
        res.status(400).json({msg: 'Token inválido!'})
    }
}

//Checa o token Admin
function checkAdm(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    try{

        const secret = process.env.SECRET

        jwt.verify(token, secret, (err, user) => {
            if (user.isAdmin == true) {
                next()
            }else{
                return res.status(401).json({msg:'Acesso Negado Admin!'})
            }
        })

    }catch(error ){
        res.status(400).json({msg: 'Token inválido!'})
    }

}


app.listen(port, () => {
    console.log(`listening on port ${port}`)
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@backend-api.3thusvv.mongodb.net/?retryWrites=true&w=majority&appName=backend-api`)
    .then(() => {

    }).catch((err) => console.log(err))
})


app.get('/', async (req, res) => {
    const filmes = await Filme.find()
    const user = await User.find().select("-password")

    if(!user) {
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }
    
    res.status(200).json({ user, filmes }) 
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

app.delete('/user/:id', async (req,res) =>{
    const filme = await Filme.findByIdAndDelete(req.params.id)
    return res.status(200).json({msg:'deletado'})
})




  
