const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x606k.mongodb.net/brand-shop?retryWrites=true&w=majority`;


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
        // Send a ping to confirm a successful connection
        const productCollection = client.db("brand-shop").collection("product");
        const cartCollection= client.db("brand-shop").collection("cart");

        app.post('/add-product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne({...newProduct, brand: req.body.brand.toLowerCase()});
            res.json({result});
        })

        app.get('/get-products', async (req, res) => {

            const query = req.query.brand;
            const brand = query.toLowerCase();

            const result = await productCollection.find({brand: brand}).toArray();
           
            res.json({result});
        })

        app.get('/get-single-product/:productId', async (req, res) => {

            const {productId} = req.params;

            const result = await productCollection.findOne({ _id: ObjectId(productId) });
           
            res.json({result});
        })

        
        app.put('/update-product', async(req,res)=>{
            const {_id, image, name, brand, type, price, description, rating}= req.body;
            const query = { _id: ObjectId(_id) }
            const update = {
                $set: {
                  image,
                 name,
                 brand,
                 type,
                 price,
                 description,
                 rating
                },
              };

            const result = await productCollection.findOneAndUpdate(query, update)

           res.json({result});
        })

        app.post("/add-to-cart",async (req,res)=>{
            const result = await cartCollection.insertOne(req.body)
            res.json({result})
        })

        app.post("/get-cart-items",async (req,res)=>{
            const {user} = req.body;
            const result= await cartCollection.find({user}).toArray();
            // console.log(data)
            if(result.length>0)
            {
                res.json({result})
            }
            else{
                res.json({ result: [] });
            }
            
        })

        app.delete("/delete-cart-item/:id",async (req,res)=>{
            const {id} = req.params;
            const result= await cartCollection.deleteOne({_id: ObjectId(id)})
            console.log(result)
            res.json({result})
           
            
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }


    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`)
})