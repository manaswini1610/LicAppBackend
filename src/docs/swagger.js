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
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the token from POST /api/auth/login or /api/auth/register (Authorization: Bearer <token>)",
        },
      },
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
            convertedAt: {
              type: "string",
              format: "date-time",
              description: "Set when status becomes converted_to_client; used for yearly progress",
              example: "2026-04-10T12:00:00.000Z",
            },
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
        LoginInput: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "admin" },
            password: { type: "string", format: "password", example: "secret123" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["username", "password", "name", "mobileNumber"],
          properties: {
            username: { type: "string", example: "rahul_agent" },
            password: { type: "string", format: "password", example: "secret123" },
            name: { type: "string", example: "Rahul Sharma" },
            experience: { type: "integer", minimum: 0, maximum: 60, example: 5, description: "Years of experience (optional; default 0)" },
            mobileNumber: { type: "string", example: "9876543210", description: "10-digit mobile number" },
          },
        },
        AuthSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                token: { type: "string", description: "JWT; payload includes username, name, and sub" },
                username: { type: "string" },
                name: { type: "string" },
                experience: { type: "number" },
                mobileNumber: { type: "string" },
              },
            },
          },
        },
        DashboardOverviewStats: {
          type: "object",
          description:
            "Top KPI row: yearly target, all policy records (leads), completed (converted to client), pending",
          required: ["yearlyTarget", "totalLeads", "completedPolicies", "pendingPolicies"],
          properties: {
            yearlyTarget: { type: "integer", example: 50, description: "Annual conversion target (from query or default)" },
            totalLeads: { type: "integer", example: 12, description: "Count of all policy documents" },
            completedPolicies: { type: "integer", example: 9, description: "status = converted_to_client" },
            pendingPolicies: {
              type: "integer",
              example: 0,
              description:
                "Same rules as GET /api/policies: defaults to status=pending and followUpRange=upcoming (pending with nextFollowUpDate from tomorrow). Use pendingCountScope=all for every status=pending row.",
            },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          summary: "Register (profile + username + password)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
          },
          responses: { 201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccess" } } } } },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Login (username + password); returns JWT and profile",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
          },
          responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccess" } } } } },
        },
      },
      "/api/auth/users": {
        get: {
          summary: "List all registered users (no passwords; no auth required)",
          responses: {
            200: { description: "OK" },
          },
        },
      },
      "/api/dashboard/overview": {
        get: {
          summary: "Dashboard overview for CRM screen",
          description:
            "data.stats has yearlyTarget, totalLeads, completedPolicies, pendingPolicies. Pacing (requiredPerMonth, submittedPoliciesThisYear) is under data.annualProgress. pendingPolicies matches GET /api/policies filters (see pendingCountScope, followUpRange).",
          parameters: [
            {
              in: "query",
              name: "yearlyTarget",
              schema: { type: "integer", minimum: 1, default: 360 },
              description:
                "Annual policy target (policies converted to clients). If targetPerMonth is set, yearly target = targetPerMonth * 12",
            },
            {
              in: "query",
              name: "targetPerMonth",
              schema: { type: "integer", minimum: 1 },
              description: "Optional; when set, overrides yearlyTarget with 12 * targetPerMonth",
            },
            {
              in: "query",
              name: "pendingCountScope",
              schema: { type: "string", enum: ["all", "list"] },
              description:
                "all = count every status=pending policy. Omit or list = same as leads list (default followUpRange=upcoming unless followUpRange is set)",
            },
            {
              in: "query",
              name: "followUpRange",
              schema: { type: "string", enum: ["today", "upcoming"] },
              description: "When counting pending (list scope), narrows by nextFollowUpDate like GET /api/policies",
            },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          stats: { $ref: "#/components/schemas/DashboardOverviewStats" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/dashboard/summary": {
        get: {
          summary: "Dashboard summary",
          parameters: [
            {
              in: "query",
              name: "pendingCountScope",
              schema: { type: "string", enum: ["all", "list"] },
              description: "Same as GET /api/dashboard/overview",
            },
            {
              in: "query",
              name: "followUpRange",
              schema: { type: "string", enum: ["today", "upcoming"] },
              description: "Same as GET /api/dashboard/overview",
            },
          ],
          responses: { 200: { description: "OK" } },
        },
      },
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
