/**
 * GLAM API Entry Point
 *
 * Includes polyfill for React Native environment
 *
 * @example
 * ```typescript
 * import { client, useAuthQuery } from '@cupist/openapi-manager/glam-api';
 * ```
 */

import "../polyfill";
// Polyfill MUST be imported first

// Glam Client
export * from "./client";

// GLAM OpenAPI with Client
export * from "./generated";

// GLAM App Layer (hooks, context, etc.)
export * from "./react-queries";
