const app = require('express')()
const http = require('http')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const fs = require('fs');

http.createServer(app).listen(3000)
console.log("Listening at:// port:%s (HTTP)", 3000)

app.use('/napewnoniedokumentacja', swaggerUi.serve, swaggerUi.setup(swaggerFile))

if (!fs.existsSync('./database/gamelist.json')) {
    fs.writeFileSync('./database/gamelist.json', '[]');
}

const game_list = JSON.parse(fs.readFileSync('./database/gamelist.json'));
game_list.map(obj => {
    if (!fs.existsSync(`./database/highscores_${obj.id}.json`)) {
        fs.writeFileSync(`./database/highscores_${obj.id}.json`, '[]');
    }
});

require('./endpoints')(app)