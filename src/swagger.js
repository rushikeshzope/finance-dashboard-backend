import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'API documentation for the Finance Dashboard backend',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://finance-dashboard-backend-production-aad2.up.railway.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);