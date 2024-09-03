const jwt = require('jsonwebtoken')
const User = require('../models/User')

//Checa o token login
module.exports = {
async checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ msg: 'Acesso Negado token!' })
    }

    try {

        const secret = process.env.SECRET

        jwt.verify(token, secret, async (err, decoded) => {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'Usuário não encontrado' });
            }
            req.user = user
            next()
        })

    } catch (error) {
        res.status(400).json({ msg: 'Token inválido!' })
    }
}
}