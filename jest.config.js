const nextJest = require('next/jest');
const create = nextJest({ dir: './' });

module.exports = create({
  testEnvironment: 'jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
});
