
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
        var success = false

        try {
            await collection.insertOne(data)
            success = true
        }catch(e){
            console.log(e)
            success = false
        }

        return success
    },
    async findAll(collection, query){
        try {
            await client.connect();
            const results = await collection.find(query)
            client.close()
            return results
        } catch(e) {
            console.log(e)
            client.close()
            return false
        }
    },
    async findOne(collection, query){
        try {
            await client.connect()
            const results = await collection.findOne(query)
            client.close()
            return results
        } catch(e) {
            console.log(e)
            client.close()
            return false
        }
    },
    async deleteOne(collection, query){
        try {
            await client.connect()
            await collection.deleteOne(query)
            client.close()
            return true
        } catch(e) {
            console.log(e)
            client.close()
            return false
        }
    },
    async updateOne(collection, query, update){
        try {
            await client.connect()
            await collection.findOneAndUpdate(query, update)
            client.close()
            return true
        } catch(e) {
            console.log(e)
            client.close()
            return false
        }
    }
}

