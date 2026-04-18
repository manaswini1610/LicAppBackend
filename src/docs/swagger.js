import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Insurance Policy Management API",
      version: "1.0.0",
      description: "Production-ready backend APIs for policies, follow-ups and dashboard",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      schemas: {
        Policy: {
          type: "object",
          properties: {
            policyNumber: { type: "string", example: "POL-2026-001" },
            customerName: { type: "string", example: "Rahul Sharma" },
            customerPhone: { type: "string", example: "9876543210" },
            customerEmail: { type: "string", format: "email", example: "rahul@example.com" },
            policyType: { type: "string", example: "Term Life" },
            policyTerm: {
              type: "string",
              enum: ["monthly", "quarterly", "half_yearly", "yearly"],
              example: "yearly",
            },
            premiumAmount: { type: "number", example: 15000 },
            startDate: { type: "string", format: "date-time", example: "2026-04-01T00:00:00.000Z" },
            endDate: { type: "string", format: "date-time", example: "2027-03-31T00:00:00.000Z" },
            nextFollowUpDate: {
              type: "string",
              format: "date-time",
              example: "2026-04-09T00:00:00.000Z",
            },
            status: { type: "string", enum: ["pending", "converted_to_client"], example: "pending" },
            agentName: { type: "string", example: "Amit Verma" },
            notes: { type: "string", example: "First year policy" },
          },
        },
        CreatePolicyInput: {
          type: "object",
          required: ["customerName"],
          properties: {
            customerName: { type: "string", example: "Rahul Sharma" },
            customerPhone: { type: "string", example: "9876543210" },
            customerEmail: { type: "string", format: "email", example: "rahul@example.com" },
            policyType: { type: "string", example: "Term Life" },
            policyTerm: {
              type: "string",
              enum: ["monthly", "quarterly", "half_yearly", "yearly"],
              example: "yearly",
            },
            premiumAmount: { type: "number", minimum: 0, example: 15000 },
            startDate: { type: "string", format: "date-time", example: "2026-04-01T00:00:00.000Z" },
            endDate: { type: "string", format: "date-time", example: "2027-03-31T00:00:00.000Z" },
            nextFollowUpDate: {
              type: "string",
              format: "date-time",
              example: "2026-04-09T00:00:00.000Z",
            },
            status: { type: "string", enum: ["pending", "converted_to_client"], example: "pending" },
            agentName: { type: "string", example: "Amit Verma" },
            notes: { type: "string", example: "First year policy" },
          },
        },
        UpdatePolicyInput: {
          type: "object",
          properties: {
            policyNumber: { type: "string", example: "POL-2026-001" },
            customerName: { type: "string", example: "Rahul Sharma" },
            customerPhone: { type: "string", example: "9876543210" },
            customerEmail: { type: "string", format: "email", example: "rahul@example.com" },
            policyType: { type: "string", example: "Term Life" },
            policyTerm: {
              type: "string",
              enum: ["monthly", "quarterly", "half_yearly", "yearly"],
              example: "yearly",
            },
            premiumAmount: { type: "number", minimum: 0, example: 15000 },
            startDate: { type: "string", format: "date-time", example: "2026-04-01T00:00:00.000Z" },
            endDate: { type: "string", format: "date-time", example: "2027-03-31T00:00:00.000Z" },
            nextFollowUpDate: {
              type: "string",
              format: "date-time",
              example: "2026-04-09T00:00:00.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "converted_to_client"],
              example: "converted_to_client",
            },
            agentName: { type: "string", example: "Amit Verma" },
            notes: { type: "string", example: "Updated notes" },
          },
        },
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
            meta: { type: "object" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errorCode: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/api/dashboard/overview": {
        get: {
          summary: "Dashboard overview for CRM screen",
          parameters: [
            {
              in: "query",
              name: "yearlyTarget",
              schema: { type: "integer", minimum: 1, default: 360 },
              description: "Agent annual target used to compute progress widgets",
            },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/dashboard/summary": { get: { summary: "Dashboard summary", responses: { 200: { description: "OK" } } } },
      "/api/dashboard/recent-policies": {
        get: {
          summary: "Recent policies",
          parameters: [{ in: "query", name: "limit", schema: { type: "integer", default: 10 } }],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/dashboard/followups/today": {
        get: { summary: "Today pending follow-ups", responses: { 200: { description: "OK" } } },
      },
      "/api/policies": {
        post: {
          summary: "Create policy",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreatePolicyInput" },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
        get: {
          summary: "List policies with filters",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1, minimum: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 10, minimum: 1, maximum: 100 } },
            { in: "query", name: "search", schema: { type: "string" } },
            {
              in: "query",
              name: "status",
              schema: { type: "string", enum: ["pending", "converted_to_client"] },
            },
            { in: "query", name: "policyType", schema: { type: "string" } },
            { in: "query", name: "startDateFrom", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "startDateTo", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "endDateFrom", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "endDateTo", schema: { type: "string", format: "date-time" } },
            {
              in: "query",
              name: "followUpRange",
              schema: { type: "string", enum: ["today", "upcoming"] },
            },
            { in: "query", name: "sortBy", schema: { type: "string", default: "createdAt" } },
            { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/policies/{id}": {
        get: {
          summary: "Get policy by id",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK" } },
        },
        put: {
          summary: "Update full policy",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdatePolicyInput" },
              },
            },
          },
          responses: { 200: { description: "OK" } },
        },
        delete: {
          summary: "Delete policy",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
