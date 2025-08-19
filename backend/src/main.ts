import express from 'express'
import { osvitaParser } from '../scripts/websites/osvita/parser.js'
import { findParentDir } from '../utils/paths.js'

const app = express()

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World',
  })
})

app.get('/api/universities', async (req, res) => {
  const fileName = 'parsing_results.json'
  const path = findParentDir('data')
  const universities = await import(path + '/' + fileName, {with: {type: 'json'}});
  res.json({
    universities: universities.default,
  })
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