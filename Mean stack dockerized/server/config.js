
return module.exports = config = {
    mongo: {
        uri: process.env.MONGO_URL ||
        'mongodb://127.0.0.1/mean-app',
        options: []
    },
    port: process.env.port ||
    '8080'
};
