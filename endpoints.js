const fs = require('fs');

const addZero = (i) => `${i < 10 ? '0' : ''}${i}`

const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

const verifyScore = (score, vcode, verify) => {
    const toVerify = (score + vcode + 17) % 1000;
    return toVerify == verify;
}

module.exports = function (app) {

    app.get('/game', function (req, res) {
        // #swagger.tags = ['HighScore']

        /* #swagger.parameters['game'] = {
	        in: 'query',
            description: 'Nazwa gry',
            type: 'string'
        } */
        
        /* #swagger.parameters['score'] = {
	        in: 'query',
            description: 'Wynik gracza',
            type: 'int'
        } */
        
        /* #swagger.parameters['vcode'] = {
	        in: 'query',
            description: 'Dokładna data ukończenia gry',
            type: 'int'
        } */
        
        /* #swagger.parameters['verify'] = {
	        in: 'query',
            description: 'Walidacja wyniku',
            type: 'int'
        } */

        console.log(`Received request from ${req.ip} to ${req.originalUrl} via ${req.method} method`);

        // #swagger.responses[422] = { description: 'Błąd walidacji!' }
        if(!req.query.game || !req.query.score || !req.query.vcode || !req.query.verify)
            return res.status(422).json({
                "error": "game, score, vcode or verify not provided"
            });

        console.log(`Received request from ${req.ip}: (game: ${req.query.game}, score: ${req.query.score}, vcode: ${req.query.vcode}, verify: ${req.query.verify})`);

        //check if game is a two letter string
        if (req.query.game.length != 2)
            return res.status(422).json({
                "error": "game must be a two letter string"
            });

        const valid_games = JSON.parse(fs.readFileSync('./database/gamelist.json'));
        let _name = null;
        valid_games.forEach(obj => {
            if (obj.id === req.query.game) {
                _name = obj.id;
            }
        });
        if(_name == null)
            return res.status(422).json({
                "error": "Invalid game name"
                });

        if(!isNumeric(req.query.score) || !isNumeric(req.query.vcode) || !isNumeric(req.query.verify))
            return res.status(422).json({
                "error": "score, vcode or verify not numeric"
            });

        //check if score is int, not lfloat
        if (
            req.query.score % 1 != 0 ||
            req.query.vcode % 1 != 0 ||
            req.query.verify % 1 != 0 ||
            req.query.score < 0 ||
            req.query.vcode < 0 ||
            req.query.verify < 0 ||
            req.query.score > 999999999 ||
            req.query.vcode > 999999999 ||
            req.query.verify > 999)
            return res.status(400).json({
                "error": "score, vcode or verify didn't pass validation"
            });
        
        let {game, score, vcode, verify} = req.query;
        score = parseInt(score);
        vcode = parseInt(vcode);
        verify = parseInt(verify);

        // #swagger.responses[400] = { description: 'Niepoprawne dane' }
        if (!verifyScore(score, vcode, verify))
            return res.status(400).json({
                "error": "score, vcode or verify didn't pass validation"
            });

        highScoresDB = JSON.parse(fs.readFileSync(`./database/highscores_${game}.json`));
        const created_at = new Date();
        const date_string = `${addZero(created_at.getDate())}.${addZero(created_at.getMonth() + 1)}.${created_at.getFullYear()} ${addZero(created_at.getHours())}:${addZero(created_at.getMinutes())}:${addZero(created_at.getSeconds())}`;
        const toAdd = {
            created_at: date_string,
            game,
            score,
            vcode
        };
        highScoresDB.push(toAdd);
        //sort by score and vcode (score DESC, vcode ASC)
        highScoresDB.sort((a, b) => {
            if (a.score == b.score) {
                return a.vcode - b.vcode;
            }
            return b.score - a.score;
        });
        fs.writeFileSync('./database/highscores.json', JSON.stringify(highScoresDB));

        // #swagger.responses[200] = { description: 'Dodano wynik' }
        return res.status(200).json({
            response: "Success!",
            sent_data: toAdd
        });
    });
	
    app.get('/score', function (req, res) {
        // #swagger.tags = ['HighScore']

        /* #swagger.parameters['game'] = {
	        in: 'query',
            description: 'Nazwa gry',
            type: 'string'
        } */

        /* #swagger.parameters['limit'] = {
	        in: 'query',
            description: 'Limit (max 1000)',
            type: 'int'
        } */

        /* #swagger.parameters['offset'] = {
	        in: 'query',
            description: 'Offset',
            type: 'int'
        } */

        console.log(`Received request from ${req.ip} to ${req.originalUrl} via ${req.method} method`);

        // #swagger.responses[422] = { description: 'Błąd walidacji!' }
        if(!req.query.game)
        return res.status(422).json({
            "error": "game not provided"
        });
    
        //check if game is a two letter string
        if (req.query.game.length != 2)
            return res.status(422).json({
                "error": "game must be a two letter string"
            });

        const valid_games = JSON.parse(fs.readFileSync('./database/gamelist.json'));
        let _name = null;
        valid_games.forEach(obj => {
            if (obj.id === req.query.game) {
                _name = obj.id;
            }
        });
        if(_name == null)
            return res.status(422).json({
                "error": "Invalid game name"
                });

        if (!req.query.limit) req.query.limit = 1000;
        if(req.query.limit < 0 || req.query.limit > 1000) return res.json({
            "error": "limit must be between 0 and 1000"
        }, 422);

        const game = req.query.game;

        if (!req.query.offset) req.query.offset = 0;
        if(req.query.offset < 0) return res.json({
            "error": "offset must be greater than 0"
        }, 422);

        highScoresDB = JSON.parse(fs.readFileSync(`./database/highscores_${game}.json`));
        highScoresDB = highScoresDB.slice(req.query.offset, req.query.offset + req.query.limit);

        // #swagger.responses[200] = { description: 'Pobrano wyniki' }
        return res.status(200).json(highScoresDB);
    });

    app.get('/score-live/reset-adventure', function (req, res) {
        // #swagger.tags = ['HighScore']

        console.log(`Received request from ${req.ip} to ${req.originalUrl} via ${req.method} method`);

        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        let old_data = null;

        // #swagger.responses[200] = { description: 'live data' }
        let interValID = setInterval(() => {
            let new_data = JSON.parse(fs.readFileSync(`./database/highscores_RA.json`));

            if (JSON.stringify(old_data !== null ? old_data : "[]") != JSON.stringify(new_data)) {
                console.log(`Sending new data to ${req.ip}`);
                if (old_data == null) {
                    old_data = new_data;
                    res.write(`highscores: ${JSON.stringify(new_data)}\n`);
                } else {
                    let to_send = [];
                    for(let i = 0; i < new_data.length; i++) {
                        //check if not in old_data
                        if(old_data != null && old_data.filter(e => e.created_at == new_data[i].created_at && e.game == new_data[i].game && e.score == new_data[i].score && e.vcode == new_data[i].vcode).length == 0) {
                            to_send.push(new_data[i]);
                        }
                    }
                    old_data = new_data;
                    if (to_send.length > 0) {
                        res.write(`highscores: ${JSON.stringify(to_send)}\n`);
                    }
                }
            }
        }, 1000);

        // If client closes connection, stop sending events
        res.on('close', () => {
            console.log('client dropped me :c');
            clearInterval(interValID);
            res.end();
        });
    });

    app.get('/', function (req, res) {
        // #swagger.tags = ['HighScore']
        const created_at = new Date();
        const date_string = `${addZero(created_at.getDate())}.${addZero(created_at.getMonth() + 1)}.${created_at.getFullYear()} ${addZero(created_at.getHours())}:${addZero(created_at.getMinutes())}:${addZero(created_at.getSeconds())}`;

        // #swagger.responses[200] = { description: 'Witaj!' }
        return res.status(200).json({
            response: "🗿",
            created_at: date_string,
        });
    });
}