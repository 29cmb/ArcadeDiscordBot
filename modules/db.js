
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@${process.env.dbURL}/?retryWrites=true&w=majority&appName=${process.env.dbAppName}`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db(process.env.dbName)

module.exports = {
    client: client,
    databases: {
        main: database
    },
    collections: {
        credentials: database.collection(process.env.credentialsCollectionName) 
    },
    async run() {
        try {
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } finally {
            await client.close();
        }
    },
    
}
