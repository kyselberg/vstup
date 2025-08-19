import express from 'express'
import { osvitaParser } from '../scripts/websites/osvita/parser.js'
import { queryPrograms } from './builder.js'

const app = express()

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World',
  })
})

app.get('/api/universities', async (req, res) => {
  const result = await queryPrograms();
  res.json(result);
})

app.post('/api/get-unis', async (req, res) => {
  try {
    console.log('Starting refetch process...');
    await osvitaParser();
    console.log('Refetch completed successfully');

    res.json({
      success: true,
      message: 'Universities data refreshed successfully',
    });
  } catch (error) {
    console.error('Error during refetch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh universities data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});


app.listen(8080, () => {
  console.log('Server is running on port 8080')
})