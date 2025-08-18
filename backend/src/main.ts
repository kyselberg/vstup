import express from 'express'
import universities from '../data/parsing_results.json' with { type: 'json' }
import { osvitaParser } from '../scripts/websites/osvita/parser.js'

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

app.get('/api/get-unis', async (req, res) => {
  try {
    console.log('Starting refetch process...');
    await osvitaParser();
    console.log('Refetch completed successfully');

    // Reload the updated data
    const updatedUniversities = await import('../data/parsing_results.json', { assert: { type: 'json' } });

    res.json({
      success: true,
      message: 'Universities data refreshed successfully',
      universities: updatedUniversities.default
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