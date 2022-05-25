const express = require('express')
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
function verifyJwt (req, res, next){
  const authHeader = req.headers.authorization
  if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorized access' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
      if (err) {
          return res.status(403).send({ message: 'Forbidden access' })
      }
     
      req.decoded = decoded
  next()
})
}


const uri = `mongodb+srv://${process.env.DB_USSER}:${process.env.DB_PASS}@cluster0.qpwac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
  try{
    await client.connect();
    const toolCollection = client.db('ToolManagement').collection('tools');
    const ordersCollection = client.db('ToolManagement').collection('orders');
    const makeAdminCollection = client.db('ToolManagement').collection('makeAdmins');
    const reviewCollection = client.db('ToolManagement').collection('reviews');

    const verifyAdmin =async (req,res,next)=>{
      const requested = req.decoded.email
      const requestedAccount = await userCollection.findOne({email:requested})
     
      if(requestedAccount.role==="admin"){
        next()
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    }
    app.get('/tools', async(req,res)=>{
      const qurey = {}
      const cursor =  toolCollection.find(qurey)
      const tools = await cursor.toArray()
      res.send(tools)
    })
    app.get('/tools/:id', async(req,res)=>{
      const id = req.params.id
      const qurey = {_id: ObjectId(id)}
      const tool = await toolCollection.findOne(qurey)
      res.send(tool)
  })
  app.delete('/tools/:id', async(req,res)=>{
    const id = req.params.id
    const query = {_id: ObjectId(id)}
    const result = await toolCollection.deleteOne(query)
    res.send(result)

}) 
  app.get('/user', async(req,res)=>{
    const users = await makeAdminCollection.find().toArray()
    res.send(users)
  })
  app.get('/admin/:email', async (req, res) => {
    const email = req.params.email;
    const user = await makeAdminCollection.findOne({ email: email });
    console.log(user.role);
    const isAdmin = user.role === 'admin';
    
    res.send({ admin: isAdmin })
  })
  app.put('/user/admin/:email', verifyJwt, verifyAdmin, async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const updateDoc = {
      $set: { role: 'admin' },
    };
    const result = await makeAdminCollection.updateOne(filter, updateDoc);
    res.send(result);
  })
  app.put('/user/:email',verifyJwt, async (req, res) => {
    const email = req.params.email
    const user = req.body
    const filter = { email: email }
    const options = { upsert: true };
    const updateDoc = {
      $set: user
    };
    const result = await makeAdminCollection.updateOne(filter, updateDoc, options)
    const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN,{ expiresIn: '20d' })
    res.send({result, token})

  })
   app.get('/order',verifyJwt, async(req,res)=>{
     const email =  req.query.email
     const decodedEmail = req.decoded.email
    if(email ===decodedEmail)
    { const qurey = {BuyerEmail  : email}
     const order = await ordersCollection.find(qurey).toArray()
     res.send(order)}

   })
   app.get('/order', verifyJwt, async(req,res)=>{
     const allOrder = await ordersCollection.find().toArray()
     res.send(allOrder)
   })
   app.post('/order', async(req,res)=>{
     const order= req.body
     const result = await ordersCollection.insertOne(order)
     res.send(result)
   })
   app.delete('/order/:id', async(req,res)=>{
    const id = req.params.id
    const query = {_id: ObjectId(id)}
    const result = await ordersCollection.deleteOne(query)
    res.send(result) 
 })
 app.post('/review', async(req,res)=>{
  const review= req.body
  const result = await reviewCollection.insertOne(review)
  res.send(result)
}) 


  }
  finally{

  }
}

run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('tools management')
  })
  
  app.listen(port, () => {
    console.log('tools management the server', port)
  })
