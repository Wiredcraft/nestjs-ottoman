export default () => ({
  couchbase: {
    connectionName: 'cat',
    ottomanConnectionOptions: {
      connectionString: 'couchbase://localhost',
      bucketName: 'test_bucket',
      username: 'Administrator',
      password: 'password',
    },
  },
  multiple_connections: [
    {
      connectionName: 'cat',
      ottomanConnectionOptions: {
        connectionString: 'couchbase://localhost',
        bucketName: 'test_bucket',
        username: 'Administrator',
        password: 'password',
      },
    },
    {
      connectionName: 'pets',
      collectionName: 'pet',
      ottomanConnectionOptions: {
        connectionString: 'couchbase://localhost',
        bucketName: 'test_bucket',
        username: 'Administrator',
        password: 'password',
      },
    },
  ],
});
