module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest', // Handle TypeScript files
        '^.+\\.js$': 'babel-jest', // Use Babel for JavaScript files
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    globals: {
        'ts-jest': {
            useBabelrc: true, // Use Babel config for TypeScript
        },
    },
};
