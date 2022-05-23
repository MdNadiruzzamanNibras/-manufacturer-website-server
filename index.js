const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USSER}:${process.env.DB_PASS}@cluster0.qpwac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
  try{
    await client.connect();
    const toolCollection = client.db('ToolManagement').collection('tools');
    const ordersCollection = client.db('ToolManagement').collection('orders');
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
   app.post('/order', async(req,res)=>{
     const order= req.body
     const result = await ordersCollection.insertOne(order)
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
