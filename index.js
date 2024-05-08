const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middle ware
app.use(cors({
  origin:['https://car-doctor-73f36.web.app', 'https://car-doctor-73f36.firebaseapp.com'],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());
// middle ware



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zfuxqes.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// custom middleware
const logger = async(req, res, next) => {
  console.log('Called :', req.method, req.url)
  next();
};

const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;
  console.log('Value of token in middle ware', token)
  // no token available
  if(!token){
    return res.status(401).send({message : 'Not Authorized'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //error
    if(err){
      console.log(err)
      return res.status(401).send({message: 'Not Authorized'})
    }
    //if token is valid then it would be decoded
    console.log('value in the token', decoded)
    req.user = decoded
    next()
  })
  
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const servicesCollection = client.db('carDoctor').collection('services');
    const bookingCollection = client.db('carDoctor').collection('bookings');


    // auth related api start


    // app.post('/jwt', logger, async(req, res) => {
    //   const user = req.body;
    //   console.log(user)
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    //   res
    //   .cookie('token', token, {
    //     httpOnly: true,
    //     secure: false,
    //     // sameSite: 'none'
    //   })
    //   .send({success: true})
    // });

    app.post('/jwt', async(req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success : true})
    });

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging out', user)
      res.clearCookie('token', {maxAge: 0})
      .send({success : true})
    });

    // auth related api end
    
    // services related api start  logger,
    app.get('/services',  async(req, res) => {
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    });

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options = {
        projection: {title: 1, price: 1, service_id:1, img:1}
      }
      const result = await servicesCollection.findOne(query,options);
      res.send(result);
    });

    // bookingCollection   logger, verifyToken,
    app.get('/bookings', logger, verifyToken,  async(req, res) => {
      console.log(req.query.email);
      console.log('user in the valid token',req.cookies)
      if(req.query.email !== req.user.email){
        return res.status(403).send({message : 'forbidden access'})
      }
      console.log('tok tok token', req.cookies.token)
      let query = {};
      if(req.query?.email){
        query = {email : req.query.email}
      }
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    });

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query)
      res.send(result);
    });

    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBooking = req.body;
      
      const updateDoc = {
        $set: {
          status : updatedBooking.status
        }
      }

      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result)
    });
    
    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    });
    // services related api end





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res)=> {
    res.send('Car Doctor Is Running Successfully');
});

app.listen(port, () => {
    console.log(`Car Doctor Server Is Running On Port : ${port}`)
});