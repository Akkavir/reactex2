const app = require('express')()
const http = require('http')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const fs = require('fs');

http.createServer(app).listen(3000)
console.log("Listening at:// port:%s (HTTP)", 3000)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

if (!fs.existsSync('./database/highscores.json')) {
    fs.writeFileSync('./database/highscores.json', '[]');
}

require('./endpoints')(app)