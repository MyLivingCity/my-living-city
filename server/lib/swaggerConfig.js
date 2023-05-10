const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');


// Swagger config
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API for My Living City Application',
    version: '1.0.0',
    description:
      'This is a REST application made specifically for the My Living City application',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    contact: {
      name: 'My Living City Contact us Form ',
      url: 'https://mylivingcity.org',
    },
  },
  servers: [
    {
      url: `http://localhost:3001`,
      description: 'Development server',
    },
    {
      url: 'https://api.mylivingcity.org',
      description: 'Production Server'
    }
  ]
};

const swaggerSpec =  swaggerJSDoc({
	swaggerDefinition,
	apis: [ './controllers/*.js' ]
});

module.exports = {
  swaggerSpec,
}
