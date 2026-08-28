import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/tests/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/\\.next/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@auth/prisma-adapter|next-auth|@prisma|bcryptjs)/)',
  ],
  collectCoverageFrom: [
    'src/lib/moderation.ts',
    'src/lib/rate-limit.ts',
    'src/lib/security-logger.ts',
    'src/lib/ip.ts',
    'src/lib/validations.ts',
    'src/lib/upload/validation.ts',
    'src/lib/upload/config.ts',
    'src/lib/upload/processor.ts',
    'src/lib/upload/storage.ts',
    'src/lib/upload/client.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary'],
  testTimeout: 15000,
};

export default config;
