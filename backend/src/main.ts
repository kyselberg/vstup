import express from 'express'
import universities from '../data/parsing_results.json' with { type: 'json' }

const app = express()

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World',
  })
})

app.get('/api/universities', (req, res) => {
  res.json({
    universities,
  })
})

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})