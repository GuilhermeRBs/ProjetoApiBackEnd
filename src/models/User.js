const mongoose = require('mongoose')

const User = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    isAdmin: Boolean,
    logincontagem: Number
}) 

//adicionar um campo para o numero de acessos incrimentar cada login 
//rota para mostrar o numero de acessos do usuário

module.exports = User