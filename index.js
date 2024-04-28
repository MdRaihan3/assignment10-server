const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cy5pfmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const myCountriesCollection = client.db('touristDB').collection('countries')
        const mySpotsCollection = client.db('touristDB').collection('myCountrySpots')

        app.get('/countries', async (req, res) => {
            const result = await myCountriesCollection.find().toArray()
            res.send(result)
        })

        app.get('/allSpot', async(req,res)=>{
            const result = await mySpotsCollection.find().toArray();
            res.send(result)
        })

        app.get('/userSpot/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await mySpotsCollection.findOne(query)
            res.send(result)
        })

        app.get('/spotList/:country', async (req, res) => {
            const country = req.params.country;
            console.log(country)
            const query = { country_Name: (country) }
            const cursor = mySpotsCollection.find(query);
            const result = await cursor.toArray()
            res.send(result);
        })

        app.get('/userSpotList/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = { email: (email) }
            const cursor = mySpotsCollection.find(query);
            const result = await cursor.toArray()
            res.send(result);
        })

        app.post('/addSpot', async (req, res) => {
            const newSpots = req.body;
            const result = await mySpotsCollection.insertOne(newSpots);
            res.send(result);
        })

        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedSpot = req.body;
            const newUpdatedSpot = {
                $set: {
                    image: updatedSpot.image,
                    tourists_spot_name: updatedSpot.tourists_spot_name,
                    country_Name: updatedSpot.country_Name,
                    location: updatedSpot.location,
                    description: updatedSpot.description,
                    average_cost: updatedSpot.average_cost,
                    seasonality: updatedSpot.seasonality,
                    travel_time: updatedSpot.travel_time,
                    totalVisitorsPerYear: updatedSpot.totalVisitorsPerYear,
                }
            }
            const result = await mySpotsCollection.updateOne(filter, newUpdatedSpot)
            res.send(result)
        })

        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await mySpotsCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment.Now You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Tourist Server is running')
})

app.listen(port, () => {
    console.log(`Tourist Server is running on port: ${port}`)
})