const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const fs = require('fs')
const app = express()
const cors = require('cors')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
const port = 23456


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/object/:id', (req, res) => {
  const records = []
  records.push(JSON.parse(fs.readFileSync(req.params.id)))
  res.send(records)
})

app.post('/object', (req, res) => {
  try {
    console.log("POST")
    if (!req.body.oid) {
      res.status(400).send({ msg: 'Missing OID' })
    }
    if (fs.existsSync(req.body.oid)) {
      res.status(400).send({ msg: `ID ${req.body.oid} existed` })
    }
    req.body.txid = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex')
    req.body.last_tx = null
    req.body.next_tx = null
    const records = [req.body]
    fs.writeFileSync(req.body.oid, JSON.stringify(records))
    res.send({ msg: 'Success' })
  } catch (e) {
    res.status(500).send({ msg: 'Internal Server Error' })
  }
})

app.put('/object', (req, res) => {
  try {
    console.log("PUT")
    if (!req.body.oid) {
      res.status(400).send({ msg: 'Missing OID' })
    }
    if (!fs.existsSync(req.body.oid)) {
      res.status(400).send({ msg: `ID ${req.body.oid} doesn't existed` })
    }
    const records = JSON.parse(fs.readFileSync(req.body.oid))
    records.push(req.body)
    fs.writeFileSync(req.body.oid, JSON.stringify(records))
    res.send({ msg: 'Success' })
  } catch (e) {
    res.status(500).send({ msg: 'Internal Server Error' })
  }
})

app.post('/transaction', (req, res) => {
  try {
    console.log("POST")
    if (!req.body.oid) {
      res.status(400).send({ msg: 'Missing OID' })
    }
    if (fs.existsSync(req.body.oid)) {
      res.status(400).send({ msg: `ID ${req.body.oid} existed` })
    }
    req.body.txid = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex')
    req.body.last_tx = null
    req.body.next_tx = null
    const records = [req.body]
    fs.writeFileSync(req.body.oid, JSON.stringify(records))
    res.send({ msg: 'Success' })
  } catch (e) {
    res.status(500).send({ msg: 'Internal Server Error' })
  }
})

app.put('/transaction', (req, res) => {
  try {
    console.log("PUT")
    if (!req.body.oid) {
      res.status(400).send({ msg: 'Missing OID' })
    }
    if (!fs.existsSync(req.body.oid)) {
      res.status(400).send({ msg: `ID ${req.body.oid} doesn't existed` })
    }
    const records = JSON.parse(fs.readFileSync(req.body.oid))
    records.push(req.body)
    fs.writeFileSync(req.body.oid, JSON.stringify(records))
    res.send({ msg: 'Success' })
  } catch (e) {
    res.status(500).send({ msg: 'Internal Server Error' })
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})