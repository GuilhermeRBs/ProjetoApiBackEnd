require('dotenv').config()
const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { jwtDecode } = require('jwt-decode')

const User = require('../models/User')

// Login
router.post('/auth/login', async (req, res) => {

    const { email, password } = req.body

    //validacao
    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório!' })
    }

    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória!' })
    }

    //Check user existe
    const user = await User.findOne({ email: email })

    if (!user) {
        return res.status(404).json({ msg: 'Usuário ou Senha invalida!' })
    }

    //Check senha igual
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        return res.status(422).json({ msg: 'Usuário ou Senha invalida!' })
    }

    //Criação token
    try {
        const secret = process.env.SECRET
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin },
            secret,
        )
        const decoded = jwtDecode(token)


        res.status(200).json({ msg: 'Autenticação realizada com sucesso', token, decoded })


    } catch (err) {
        console.log('error')
        res.status(500).json({ msg: 'Aconteceu um erro no servidor!' })
    }
})

module.exports = router