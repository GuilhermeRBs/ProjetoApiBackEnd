require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())


LoginRouter = require('./routes/login')
app.use('/', LoginRouter)

installRouter = require('./routes/install')
app.use('/', installRouter)

filmeRouter = require('./routes/filme')
app.use('/', filmeRouter)

usuariosRouter = require('./routes/usuarios')
app.use('/', usuariosRouter)

// Credenciais BD
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

const port = 3000

app.listen(port, () => {
    console.log(`listening on port ${port}`)
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@backend-api.3thusvv.mongodb.net/?retryWrites=true&w=majority&appName=backend-api`)
    .then(() => {

    }).catch((err) => console.log(err))
})


