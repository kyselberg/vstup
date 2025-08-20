import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { osvitaParser } from '../scripts/websites/osvita/parser.js';
import { queryPrograms } from './builder.js';

const activeConnections: express.Response[] = [];

const app = express()

app.use(cors({
  origin: ['https://uni.youwillmiss.dev'],
}))

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

    osvitaParser().then(() => {
      console.log('Refetch completed successfully');

      activeConnections.forEach(connection => {
        try {
          connection.write(`data: ${JSON.stringify({
            type: 'update',
            message: 'Universities data refreshed successfully',
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          console.error('Error sending SSE to connection:', error);
        }
      });

      activeConnections.splice(0, activeConnections.length,
        ...activeConnections.filter(conn => !conn.destroyed)
      );
    }).catch((error) => {
      console.error('Parser error:', error);

      activeConnections.forEach(connection => {
        try {
          connection.write(`data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to refresh universities data',
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          console.error('Error sending SSE to connection:', error);
        }
      });
    });

    res.json({
      success: true,
      message: 'Universities data refresh started',
    });
  } catch (error) {
    console.error('Error during refetch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start universities data refresh',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/events', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  activeConnections.push(res);

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  sendEvent({
    type: 'connection',
    message: 'SSE connection established',
    timestamp: new Date().toISOString()
  });

  const interval = setInterval(() => {
    sendEvent({
      type: 'heartbeat',
      message: 'Current time',
      time: new Date().toISOString(),
    });
  }, 5000);

  res.on('close', () => {
    clearInterval(interval);
    const index = activeConnections.indexOf(res);
    if (index > -1) {
      activeConnections.splice(index, 1);
    }
  })
})


app.listen(8080, () => {
  console.log('Server is running on port 8080')
})