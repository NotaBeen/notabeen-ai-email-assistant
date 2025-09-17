// jest.config.js

/**
 * @fileoverview Jest configuration for Next.js projects.
 * This file sets up the testing environment, including module aliases,
 * asset mocking, and the appropriate test environment for server-side code.
 */

const nextJest = require("next/jest");

// Load the Next.js app to ensure Jest can resolve paths and environment variables
const createJestConfig = nextJest({ dir: "./" });

/**
 * Custom Jest configuration options.
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const customJestConfig = {
  // A list of paths to modules that run before Jest is initialized.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // The test environment that will be used for testing.
  // 'node' is the correct environment for Next.js API routes.
  testEnvironment: "node",

  // A list of paths to ignore when looking for test files.
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // A list of paths to directories that contain your modules.
  moduleDirectories: ["node_modules", "<rootDir>/"],

  // A map from a module name to a module path.
  // This is used to mock CSS and other assets that are not relevant for server-side testing.
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};

// Combine the Next.js and custom configurations and export them.
// This is the recommended way to export Jest config for `app` directory support.
module.exports = createJestConfig(customJestConfig);
