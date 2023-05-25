const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json())

// const corsOptions ={
//   origin:'*',
//   credentials:true,
//   optionSuccessStatus:200,
//   }
//   app.use(cors(corsOptions))

// const uri = "mongodb+srv://<username>:<password>@cluster0.wvig2d6.mongodb.net/?retryWrites=true&w=majority"; 
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-hzckllx-shard-00-00.wvig2d6.mongodb.net:27017,ac-hzckllx-shard-00-01.wvig2d6.mongodb.net:27017,ac-hzckllx-shard-00-02.wvig2d6.mongodb.net:27017/?ssl=true&replicaSet=atlas-sxh7jl-shard-0&authSource=admin&retryWrites=true&w=majority`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   maxPoolSize: 10,
// });

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
    // await client.connect();

    // client.connect((error)=>{
    //   if(error){
    //     console.log(error)
    //     return;
    //   }
    // });


    const toyCollection = client.db("AquaLeapToy").collection("toyCollection")   
    const blogsCollection = client.db("AquaLeapToy").collection("blogsCollection")   
    const savedBlogsCollection = client.db("AquaLeapToy").collection("savedBlogs")   
    // const result1 = await toyCollection.createIndex({toyName: 1})
    // const result2 = await toyCollection.createIndex({category: 1})
    // const result3 = await toyCollection.createIndex({price: 1})
    
    // get my toys by email and sorting
    app.get("/myToys", async(req,res)=>{
        const email = req.query.email;
        const sortingType = req.query.sort;
        let sortingValue = null
        if(sortingType ==="ascending"){
          sortingValue = 1
        } 
        else if(sortingType==="descending"){
          sortingValue = -1
        }
        
        const query = {email: email}
        
        if(sortingValue){
          const result = await toyCollection.find(query).sort({price:sortingValue}).toArray()
          res.send(result)
        }
        else{
          const result = await toyCollection.find(query).toArray()
          res.send(result)
        }
        
        
    })
    // get single toy details
    app.get("/toy/:id", async(req,res)=>{
      const id = req.params.id.toString();
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
      res.send(result)
    })

    // find data by category
    app.get("/category/:type",async(req,res)=>{
      const type = req.params.type;
      const result = await toyCollection.find({category: {$regex:type}}).toArray()
      res.send(result)
    })

    // get all toys 
    app.get("/allToys",async(req,res)=>{
      const result = await toyCollection.find().toArray()
      res.send(result) 
    })

    // get number of total toys 
    app.get("/totalToys", async(req,res)=>{
      const result = await toyCollection.estimatedDocumentCount();
      res.send({result})
    })

    // get limited toy for pagination
    app.get("/toys", async(req,res)=>{
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;
      const result = await toyCollection.find().skip(skip).limit(limit).toArray();
      res.send(result)
    })

    // getting search result
    app.get("/toys/:text", async(req,res)=>{
      const text = req.params.text;
      const result = await toyCollection.find({toyName: {$regex:text, $options: "i"}}).toArray()
      res.send(result)
    })
    // updating
    app.patch("/updateToys/:id", async(req,res)=>{
      const id = req.params.id;
      const updatedToy = req.body;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc ={
        $set:{
          toyName:updatedToy.toyName, 
          photoURL:updatedToy.photoURL, 
          sellerName:updatedToy.sellerName, 
          price: parseInt(updatedToy.price), 
          rating:parseInt(updatedToy.rating), 
          quantity:parseInt(updatedToy.quantity), 
          description:updatedToy.description, 
          time:updatedToy.time
        }
      }
      const result = await toyCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })

    // delete single toy
    app.delete("/myToys/:id",async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query)
      res.send(result)
    })
    
    // adding toys to db
    app.post("/addAToy",async(req,res)=>{
        const toy = req.body;
        const result = await toyCollection.insertOne(toy);
        res.send(result)
    })

    // getting blogs all 
    app.get("/blogs", async(req,res)=>{
      const result = await blogsCollection.find().toArray()
      res.send(result)
    })
    
    // getting pined blogs for individul user by email
    app.get("/saved-blogs", async(req,res)=>{
      const email = req.query.email;
      const result = await savedBlogsCollection.find({authorEmail:email}).toArray()
      res.send(result)
    })

    // saving pinned blogs to db 
    app.put("/add-blog", async(req,res)=>{
      const blog = req.body;
      const result = await savedBlogsCollection.insertOne(blog);
      res.send(result);
    })




   






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally {
  
  }
}
run().catch(console.dir);

app.get("/",(req,res)=>{
  res.send("Yay! Toy Market Server is running")
})


app.listen(port,()=>{
  console.log("Toy Market is running on " + port);  
})
