module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'dbname'),
        username: env('DATABASE_USERNAME', 'db_user'),
        password: env('DATABASE_PASSWORD', 'password'),
        schema: 'public',
      },
      options: {},
    },
  },
});