import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LIC App Backend API",
      version: "1.0.0",
      description: "API documentation for user endpoints",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    paths: {
      "/api/users": {
        get: {
          summary: "Get all users",
          responses: {
            200: {
              description: "Users fetched successfully",
            },
          },
        },
        post: {
          summary: "Create a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                  required: ["name", "email"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "User created successfully",
            },
            400: {
              description: "Validation failed",
            },
          },
        },
      },
      "/api/users/{id}": {
        get: {
          summary: "Get user by ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "User fetched successfully",
            },
            404: {
              description: "User not found",
            },
          },
        },
        put: {
          summary: "Update user by ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "User updated successfully",
            },
            404: {
              description: "User not found",
            },
          },
        },
        delete: {
          summary: "Delete user by ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "User deleted successfully",
            },
            404: {
              description: "User not found",
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
