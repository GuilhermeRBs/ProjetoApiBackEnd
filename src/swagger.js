const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger-output.json'; 
const endpointsFiles = ['./routes/install.js','./routes/filme.js', './routes/login.js', './routes/usuarios.js'];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
    require('./index.js'); 
});