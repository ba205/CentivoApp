const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const uri = `mongodb+srv://${username}:${password}@centivo.8fptk.mongodb.net/?retryWrites=true&w=majority&appName=Centivo`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db("yourDatabaseName"); // Replace this with your DB name
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("DB Connection failed:", err);
  }
}

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  // Validate ObjectId
  let objectId;
  try {
    objectId = new ObjectId(userId);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    // Query with schema in mind: must have age > 21
    const user = await db.collection('users').findOne({
      _id: objectId,
      age: { $gt: 21 }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or under age' });
    }

    // Return only specific fields (optional, but cleaner)
    const { _id, name, email, age } = user;
    res.json({ _id, name, email, age });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  connectToDb();
  console.log(`Server running on port ${port}`);
});
