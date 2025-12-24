import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./src/services/glam/swagger-spec.json",
  output: {
    format: "prettier",
    lint: "eslint",
    tsConfigPath: "./tsconfig.json",
    path: "./src/services/glam/generated",
  },
  client: "@hey-api/client-axios",
  plugins: [
    "@hey-api/schemas",
    {
      name: "@tanstack/react-query",
      exportFromIndex: true,
      queryOptions: "glam{{name}}QueryOptions",
      mutationOptions: "glam{{name}}MutationOptions",
      infiniteQueryOptions: "glam{{name}}InfiniteQueryOptions",
      queryKeys: "glam{{name}}QueryKeys",
      infiniteQueryKeys: "glam{{name}}InfiniteQueryKeys",
    },
    {
      name: "@hey-api/client-axios",
      runtimeConfigPath: "@glam/createOpenapi",
      exportFromIndex: true,
    },
    {
      enums: "typescript",
      name: "@hey-api/typescript",
      exportFromIndex: true,
    },
    {
      dates: true,
      bigInt: false,
      name: "@hey-api/transformers",
      exportFromIndex: true,
    },
    {
      name: "@hey-api/sdk",
      transformer: true,
      asClass: true,
      exportFromIndex: true,
    },
  ],
  parser: {
    transforms: {
      enums: "root",
    },
  },
});
