const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'naufal.febriyanto',
    host: 'ep-still-sound-718730.ap-southeast-1.aws.neon.tech',
    database: 'SayaSehat',
    password: 'Dj57bFqZhgTC',
    port: 5432,
    sslmode: 'require',
    ssl: true,
});

module.exports = pool;