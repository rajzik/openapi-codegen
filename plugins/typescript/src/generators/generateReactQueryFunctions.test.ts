import { describe, expect, it } from "vitest";
import { OpenAPIObject } from "openapi3-ts";
import {
  Config,
  generateReactQueryFunctions,
} from "./generateReactQueryFunctions";
import { createWriteFileMock } from "../testUtils";

const config: Config = {
  filenamePrefix: "petstore",
  schemasFiles: {
    parameters: "petstoreParameters",
    schemas: "petstoreSchemas",
    responses: "petstoreResponses",
    requestBodies: "petstoreRequestBodies",
  },
};

describe("generateReactQueryFunctions", () => {
  it("should inject the customFetch import", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {},
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => false, // customFetcher is not there
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFetcher.ts");
  });

  it("should generate a useQuery wrapper (no parameters)", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            description: "Get all the pets",
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";

      export type ListPetsError = Fetcher.ErrorWrapper<undefined>;

      export type ListPetsResponse = Schemas.Pet[];

      export type ListPetsVariables = PetstoreContext["fetcherOptions"];

      /**
       * Get all the pets
       */
      export const fetchListPets = (
        variables: ListPetsVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<ListPetsResponse, ListPetsError, undefined, {}, {}, {}>({
          url: "/pets",
          method: "get",
          ...variables,
          signal,
        });

      /**
       * Get all the pets
       */
      export const listPetsQuery = (
        variables: ListPetsVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({ signal }: { signal?: AbortSignal }) => Promise<ListPetsResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets",
          operationId: "listPets",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchListPets(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets";
        operationId: "listPets";
        variables: ListPetsVariables;
      };
      "
    `);
  });

  it("should generate a useQuery wrapper (with queryParams)", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            description: "Get all the pets",
            parameters: [
              {
                in: "query",
                name: "breed",
                description: "Filter on the dog breed",
                required: true,
                schema: {
                  type: "string",
                },
              },
              { $ref: "#/components/parameters/colorParam" },
            ],
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        parameters: {
          colorParam: {
            in: "query",
            description: "Color of the dog",
            name: "color",
            schema: {
              type: "string",
              enum: ["white", "black", "grey"],
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";

      export type ListPetsQueryParams = {
        /**
         * Filter on the dog breed
         */
        breed: string;
        /**
         * Color of the dog
         */
        color?: "white" | "black" | "grey";
      };

      export type ListPetsError = Fetcher.ErrorWrapper<undefined>;

      export type ListPetsResponse = Schemas.Pet[];

      export type ListPetsVariables = {
        queryParams: ListPetsQueryParams;
      } & PetstoreContext["fetcherOptions"];

      /**
       * Get all the pets
       */
      export const fetchListPets = (
        variables: ListPetsVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<
          ListPetsResponse,
          ListPetsError,
          undefined,
          {},
          ListPetsQueryParams,
          {}
        >({ url: "/pets", method: "get", ...variables, signal });

      /**
       * Get all the pets
       */
      export const listPetsQuery = (
        variables: ListPetsVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({ signal }: { signal?: AbortSignal }) => Promise<ListPetsResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets",
          operationId: "listPets",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchListPets(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets";
        operationId: "listPets";
        variables: ListPetsVariables;
      };
      "
    `);
  });

  it("should generate a useQuery wrapper (with pathParams)", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets/{pet_id}": {
          get: {
            operationId: "showPetById",
            description: "Info for a specific pet",
            parameters: [
              {
                in: "path",
                name: "pet_id",
                description: "The id of the pet to retrieve",
                required: true,
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";

      export type ShowPetByIdPathParams = {
        /**
         * The id of the pet to retrieve
         */
        petId: string;
      };

      export type ShowPetByIdError = Fetcher.ErrorWrapper<undefined>;

      export type ShowPetByIdResponse = Schemas.Pet[];

      export type ShowPetByIdVariables = {
        pathParams: ShowPetByIdPathParams;
      } & PetstoreContext["fetcherOptions"];

      /**
       * Info for a specific pet
       */
      export const fetchShowPetById = (
        variables: ShowPetByIdVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<
          ShowPetByIdResponse,
          ShowPetByIdError,
          undefined,
          {},
          {},
          ShowPetByIdPathParams
        >({ url: "/pets/{petId}", method: "get", ...variables, signal });

      /**
       * Info for a specific pet
       */
      export const showPetByIdQuery = (
        variables: ShowPetByIdVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({
          signal,
        }: {
          signal?: AbortSignal;
        }) => Promise<ShowPetByIdResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets/{petId}",
          operationId: "showPetById",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchShowPetById(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets/{petId}";
        operationId: "showPetById";
        variables: ShowPetByIdVariables;
      };
      "
    `);
  });

  it("should deal with injected headers (marked them as optional)", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            description: "Get all the pets",
            parameters: [
              {
                in: "header",
                name: "breed",
                description: "Filter on the dog breed",
                required: true,
                schema: {
                  type: "string",
                },
              },
              { $ref: "#/components/parameters/colorParam" },
            ],
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        parameters: {
          colorParam: {
            in: "query",
            description: "Color of the dog",
            name: "color",
            schema: {
              type: "string",
              enum: ["white", "black", "grey"],
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      { ...config, injectedHeaders: ["breed"] }
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";

      export type ListPetsQueryParams = {
        /**
         * Color of the dog
         */
        color?: "white" | "black" | "grey";
      };

      export type ListPetsHeaders = {
        /**
         * Filter on the dog breed
         */
        breed?: string;
      };

      export type ListPetsError = Fetcher.ErrorWrapper<undefined>;

      export type ListPetsResponse = Schemas.Pet[];

      export type ListPetsVariables = {
        headers?: ListPetsHeaders;
        queryParams?: ListPetsQueryParams;
      } & PetstoreContext["fetcherOptions"];

      /**
       * Get all the pets
       */
      export const fetchListPets = (
        variables: ListPetsVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<
          ListPetsResponse,
          ListPetsError,
          undefined,
          ListPetsHeaders,
          ListPetsQueryParams,
          {}
        >({ url: "/pets", method: "get", ...variables, signal });

      /**
       * Get all the pets
       */
      export const listPetsQuery = (
        variables: ListPetsVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({ signal }: { signal?: AbortSignal }) => Promise<ListPetsResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets",
          operationId: "listPets",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchListPets(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets";
        operationId: "listPets";
        variables: ListPetsVariables;
      };
      "
    `);
  });

  it("should not generated duplicated types", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            description: "Get all the pets",
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
              "201": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";

      export type ListPetsError = Fetcher.ErrorWrapper<undefined>;

      export type ListPetsResponse = Schemas.Pet[];

      export type ListPetsVariables = PetstoreContext["fetcherOptions"];

      /**
       * Get all the pets
       */
      export const fetchListPets = (
        variables: ListPetsVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<ListPetsResponse, ListPetsError, undefined, {}, {}, {}>({
          url: "/pets",
          method: "get",
          ...variables,
          signal,
        });

      /**
       * Get all the pets
       */
      export const listPetsQuery = (
        variables: ListPetsVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({ signal }: { signal?: AbortSignal }) => Promise<ListPetsResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets",
          operationId: "listPets",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchListPets(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets";
        operationId: "listPets";
        variables: ListPetsVariables;
      };
      "
    `);
  });

  it("should generate useMutation for POST operation", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pet": {
          post: {
            operationId: "AddPet",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      color: {
                        type: "string",
                      },
                      breed: {
                        type: "string",
                      },
                      age: {
                        type: "integer",
                      },
                    },
                    required: ["name", "breed", "age"],
                  },
                },
              },
            },
            responses: {
              200: {
                content: {
                  "application/json": {
                    description: "Successful response",
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
              500: {
                content: {
                  "application/json": {
                    description: "An Error",
                    schema: {
                      type: "object",
                      properties: {
                        code: {
                          type: "integer",
                          enum: [500],
                        },
                        message: {
                          type: "string",
                        },
                      },
                      required: ["code", "message"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";

      export type QueryOperation = {
        path: string;
        operationId: never;
        variables: unknown;
      };
      "
    `);
  });

  it("should generate useMutation if openapi-codegen-component is defined", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pet": {
          get: {
            operationId: "AddPet",
            "x-openapi-codegen-component": "useMutate",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      color: {
                        type: "string",
                      },
                      breed: {
                        type: "string",
                      },
                      age: {
                        type: "integer",
                      },
                    },
                    required: ["name", "breed", "age"],
                  },
                },
              },
            },
            responses: {
              200: {
                content: {
                  "application/json": {
                    description: "Successful response",
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
              500: {
                content: {
                  "application/json": {
                    description: "An Error",
                    schema: {
                      type: "object",
                      properties: {
                        code: {
                          type: "integer",
                          enum: [500],
                        },
                        message: {
                          type: "string",
                        },
                      },
                      required: ["code", "message"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";

      export type QueryOperation = {
        path: string;
        operationId: never;
        variables: unknown;
      };
      "
    `);
  });

  it("should resolve requestBody ref", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      components: {
        requestBodies: {
          dog: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    color: {
                      type: "string",
                    },
                    breed: {
                      type: "string",
                    },
                    age: {
                      type: "integer",
                    },
                  },
                  required: ["name", "breed", "age"],
                },
              },
            },
          },
        },
      },
      paths: {
        "/pet": {
          post: {
            operationId: "AddPet",
            requestBody: {
              $ref: "#/components/requestBodies/dog",
            },
            responses: {
              200: {
                content: {
                  "application/json": {
                    description: "Successful response",
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
              500: {
                content: {
                  "application/json": {
                    description: "An Error",
                    schema: {
                      type: "object",
                      properties: {
                        code: {
                          type: "integer",
                          enum: [500],
                        },
                        message: {
                          type: "string",
                        },
                      },
                      required: ["code", "message"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";

      export type QueryOperation = {
        path: string;
        operationId: never;
        variables: unknown;
      };
      "
    `);
  });

  it("should deal with pathParams", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      components: {
        requestBodies: {
          UpdatePetRequestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
      paths: {
        "/pet/{pet_id}": {
          parameters: [
            {
              in: "path",
              name: "pet_id",
              schema: {
                type: "string",
              },
              required: true,
            },
          ],
          put: {
            operationId: "updatePet",
            requestBody: {
              $ref: "#/components/requestBodies/UpdatePetRequestBody",
            },
            responses: {
              200: {
                content: {
                  "application/json": {
                    description: "Successful response",
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";

      export type QueryOperation = {
        path: string;
        operationId: never;
        variables: unknown;
      };
      "
    `);
  });

  it("should build components without prefix", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      components: {
        requestBodies: {
          UpdatePetRequestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
      paths: {
        "/pet/{pet_id}": {
          parameters: [
            {
              in: "path",
              name: "pet_id",
              schema: {
                type: "string",
              },
              required: true,
            },
          ],
          put: {
            operationId: "updatePet",
            requestBody: {
              $ref: "#/components/requestBodies/UpdatePetRequestBody",
            },
            responses: {
              200: {
                content: {
                  "application/json": {
                    description: "Successful response",
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      { ...config, filenamePrefix: "" }
    );

    expect(writeFile.mock.calls[0][0]).toBe("functions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { Context, queryKeyFn } from "./context";
      import type * as Fetcher from "./fetcher";
      import { fetch } from "./fetcher";

      export type QueryOperation = {
        path: string;
        operationId: never;
        variables: unknown;
      };
      "
    `);
  });

  it("should generate utils file if needed", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            description: "Get all the pets",
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
              "5xx": {
                description: "Server error",
                content: {
                  "application/json": {
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreUtils.ts");
    expect(writeFile.mock.calls[1][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";
      import type { ServerErrorStatus } from "./petstoreUtils";

      export type ListPetsError = Fetcher.ErrorWrapper<{
        status: ServerErrorStatus;
        payload: string;
      }>;

      export type ListPetsResponse = Schemas.Pet[];

      export type ListPetsVariables = PetstoreContext["fetcherOptions"];

      /**
       * Get all the pets
       */
      export const fetchListPets = (
        variables: ListPetsVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<ListPetsResponse, ListPetsError, undefined, {}, {}, {}>({
          url: "/pets",
          method: "get",
          ...variables,
          signal,
        });

      /**
       * Get all the pets
       */
      export const listPetsQuery = (
        variables: ListPetsVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({ signal }: { signal?: AbortSignal }) => Promise<ListPetsResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets",
          operationId: "listPets",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchListPets(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets";
        operationId: "listPets";
        variables: ListPetsVariables;
      };
      "
    `);
  });

  it("should camel case operation IDs and remove special characters", async () => {
    const writeFile = createWriteFileMock();
    const openAPIDocument: OpenAPIObject = {
      openapi: "3.0.0",
      info: {
        title: "petshop",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "list_pets",
            description: "Get all the pets",
            responses: {
              "200": {
                description: "pet response",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Pet",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await generateReactQueryFunctions(
      {
        openAPIDocument,
        writeFile,
        existsFile: () => true,
        readFile: async () => "",
      },
      config
    );

    expect(writeFile.mock.calls[0][0]).toBe("petstoreFunctions.ts");
    expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
      "/**
       * Generated by @openapi-codegen
       *
       * @version 1.0.0
       */
      import * as reactQuery from "@tanstack/react-query";
      import { PetstoreContext, queryKeyFn } from "./petstoreContext";
      import type * as Fetcher from "./petstoreFetcher";
      import { petstoreFetch } from "./petstoreFetcher";
      import type * as Schemas from "./petstoreSchemas";

      export type ListPetsError = Fetcher.ErrorWrapper<undefined>;

      export type ListPetsResponse = Schemas.Pet[];

      export type ListPetsVariables = PetstoreContext["fetcherOptions"];

      /**
       * Get all the pets
       */
      export const fetchListPets = (
        variables: ListPetsVariables,
        signal?: AbortSignal,
      ) =>
        petstoreFetch<ListPetsResponse, ListPetsError, undefined, {}, {}, {}>({
          url: "/pets",
          method: "get",
          ...variables,
          signal,
        });

      /**
       * Get all the pets
       */
      export const listPetsQuery = (
        variables: ListPetsVariables,
      ): {
        queryKey: reactQuery.QueryKey;
        queryFn: ({ signal }: { signal?: AbortSignal }) => Promise<ListPetsResponse>;
      } => ({
        queryKey: queryKeyFn({
          path: "/pets",
          operationId: "listPets",
          variables,
        }),
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchListPets(variables, signal),
      });

      export type QueryOperation = {
        path: "/pets";
        operationId: "listPets";
        variables: ListPetsVariables;
      };
      "
    `);
  });
});
