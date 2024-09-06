require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Filme = require('../models/Filme')



router.get("/install", async (req, res) => {
    const salt = await bcrypt.genSalt(12)
    const password = 'admin'
    const passwordHash = await bcrypt.hash(password, salt)
    const user = new User({
        name: 'Admin',
        email: 'admin@admin.com',
        password: passwordHash, 
        isAdmin: true,
        logincontagem: 0
    }) 
    user.save()
    User.create({name: 'Joao', email: 'jao@jao.com', password: 'teste', isAdmin: false})
    User.create({name: 'Pedro', email: 'Pedro@gmail.com', password: 'teste', isAdmin: false})
    User.create({name: 'Guilherme', email: 'Gui@gmail.com', password: 'teste', isAdmin: false})
    User.create({name: 'Maria', email: 'maria@gmail.com', password: 'teste', isAdmin: false})

    const filme1 = new Filme({
        Title: 'Interestelar',
        description: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial, possibilitando a continuação da espécie. Cooper é chamado para liderar o grupo e aceita a missão sabendo que pode nunca mais ver os filhos. Ao lado de Brand, Jenkins e Doyle, ele seguirá em busca de um novo lar.',
        lancamento: '06/10/2014',
        trailerUrl: 'https://www.youtube.com/watch?app=desktop&v=i6avfCqKcQo'
    }) 
    await filme1.save()

    const filme2 = new Filme({
        Title: 'Homem-Aranha: Através do Aranhaverso',
        description: 'Depois de se reunir com Gwen Stacy, Homem-Aranha é jogado no multiverso. Lá, o super-herói aracnídeo encontra uma numerosa equipe encarregada de proteger sua própria existência.',
        lancamento: '01/06/2023',
        trailerUrl: 'https://www.youtube.com/watch?v=uhkDkurK0Zg'
    })
    await filme2.save()

    const filme3 = new Filme({
        Title: 'Os Vingadores - The Avengers',
        description: 'Loki, o irmão de Thor, ganha acesso ao poder ilimitado do cubo cósmico ao roubá-lo de dentro das instalações da S.H.I.E.L.D. Nick Fury, o diretor desta agência internacional que mantém a paz, logo reúne os únicos super-heróis que serão capazes de defender a Terra de ameaças sem precedentes. Homem de Ferro, Capitão América, Hulk, Thor, Viúva Negra e Gavião Arqueiro formam o time dos sonhos de Fury, mas eles precisam aprender a colocar os egos de lado e agir como um grupo em prol da humanidade.',
        lancamento: '27/04/2012',
        trailerUrl: 'https://www.youtube.com/watch?v=eOrNdBpGMv8'
    })
    await filme3.save()

    const filme4 = new Filme({
        Title: 'Velozes e Furiosos 9',
        description: 'Dominic Toretto e Letty vivem uma vida pacata ao lado do filho. Mas eles logo são ameaçados pelo passado de Dom: seu irmão desaparecido Jakob, que retorna e está trabalhando ao lado de Cipher. Cabe a Dom reunir a equipe novamente para enfrentá-los.',
        lancamento: '24/06/2021',
        trailerUrl: 'https://www.youtube.com/watch?v=N2dx2M4L8T0&t=5s'
    })
    await filme4.save()

    const filme5 = new Filme({
        Title: 'Até o Último Homem',
        description: 'Acompanhe a história de Desmond T. Doss, um médico do exército americano que, durante a Segunda Guerra Mundial, se recusa a pegar em armas. Durante a Batalha de Okinawa ele trabalha na ala médica e salva cerca de 75 homens.',
        lancamento: '26/01/2017',
        trailerUrl: 'https://www.youtube.com/watch?v=s2-1hz1juBI'
    })
    await filme5.save()

    return res.status(200).json({msg: 'Criação efetuada com sucesso!'})

})

module.exports = router