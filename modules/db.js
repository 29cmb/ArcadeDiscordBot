
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@${process.env.dbURL}/?appName=${process.env.dbAppName}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db(process.env.dbName)

module.exports = {
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
    async insertOne(collection, data){
        try {
            await collection.insertOne(data)
            return true
        }catch(e){
            console.log(e)
            return false
        }
    },
    async findAll(collection, query){
        try {
            const results = await collection.find(query)
            return results
        } catch(e) {
            console.log(e)
            return false
        }
    },
    async findOne(collection, query){
        try {
            const results = await collection.findOne(query)
            return results
        } catch(e) {
            console.log(e)
            return false
        }
    },
    async deleteOne(collection, query){
        try {
            await collection.deleteOne(query)
            return true
        } catch(e) {
            console.log(e)
            return false
        }
    }
}

