module.exports = {
    name: "app", // Name of your application
    script: "index.ts", // Entry point of your application
    interpreter: "bun", // Bun interpreter
    env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
    }
};