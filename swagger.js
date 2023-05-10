const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./endpoints.js']

const doc = {
    info: {
        version: "1.0.0",
        title: "Reset GameDev HighScore Manager",
        description: "podobno działa"
    },
    host: "10.10.60.179:3000", //change here ip
    basePath: "/",
    schemes: ['http', 'https'],
    consumes: ['multipart/form-data'],
    produces: ['application/json'],
    tags: [
        {
            "name": "HighScore",
            "description": ""
        }
    ],
    definitions: {
    }
}

swaggerAutogen(outputFile, endpointsFiles, doc)