const jwt = require('jsonwebtoken')

module.exports = {
//Checa o token Admin
checkAdm(req, res, next){
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
} 