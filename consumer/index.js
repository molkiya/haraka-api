const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb')

const app = express();

app.use(bodyParser.json());

app.post('/api/mail', async (req, res) => {
    const db = await (await MongoClient.connect(
        `mongodb://user:password@mongo-consumer:27017/`,
    )).db(`haraka`);
    const mongoRes = await db.collection('haraka').insertOne({ params: JSON.parse(req.body.data) });
    return res.send("OK")
});

app.listen(3001, () => {
    console.log(`[CONSUMER-API] Consumer listening on the port ${3001}`);
})