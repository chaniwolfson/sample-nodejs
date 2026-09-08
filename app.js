const express = require('express');
const packageJson = require('./package.json');
const promClient = require('prom-client');

const app = express();
const port = process.env.PORT || 8080;

// קריאת משתני הסביבה מה-ConfigMap וה-Deployment
const APP_ENV = process.env.APP_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const APP_VERSION = process.env.APP_VERSION || packageJson.version;

// Create a Registry to register the metrics
const register = new promClient.Registry();
// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

const helloWorldCounter = new promClient.Counter({
    name: 'root_access_total',
    help: 'Total number of accesses to the root path',
});
register.registerMetric(helloWorldCounter);

app.get('/version', (req, res) => {
  res.json({ version: APP_VERSION });
});

app.get('/my-app', (req, res) => {
    helloWorldCounter.inc();

    // עיצוב HTML צבעוני וגדול בדפדפן
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Node.js Kubernetes Dashboard</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #f8fafc;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
            }
            .card {
                background: rgba(30, 41, 59, 0.8);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 100%;
                text-align: center;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 24px;
                color: #38bdf8;
                text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
            }
            .info-grid {
                display: flex;
                flex-direction: column;
                gap: 16px;
                text-align: left;
            }
            .info-item {
                background: rgba(15, 23, 42, 0.6);
                padding: 16px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .label {
                font-weight: 600;
                color: #94a3b8;
                font-size: 1.1rem;
            }
            .value {
                font-size: 1.2rem;
                font-weight: 700;
            }
            .badge-env {
                background-color: #10b981;
                color: #022c22;
                padding: 4px 12px;
                border-radius: 9999px;
            }
            .badge-log {
                background-color: #f59e0b;
                color: #451a03;
                padding: 4px 12px;
                border-radius: 9999px;
            }
            .badge-version {
                background-color: #6366f1;
                color: #ffffff;
                padding: 4px 12px;
                border-radius: 9999px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🚀 Hello, World!</h1>
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Environment</span>
                    <span class="value badge-env">${APP_ENV}</span>
                </div>
                <div class="info-item">
                    <span class="label">Log Level</span>
                    <span class="value badge-log">${LOG_LEVEL}</span>
                </div>
                <div class="info-item">
                    <span class="label">Application Version</span>
                    <span class="value badge-version">${APP_VERSION}</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse);
});

app.get('/about', (req, res) => {
    res.send('This is a sample Node.js application for Kubernetes deployment testing.');
});

app.get('/ready', (req, res) => {
    res.status(200).send('Ready');
});

app.get('/live', (req, res) => {
    res.status(200).send('Alive');
});

app.get('/classified', (req, res) => {
    res.status(200).send('You should not be here!!!');
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(port, () => {
    console.log(`Server running on port ${port} [Env: ${APP_ENV}, LogLevel: ${LOG_LEVEL}, Version: ${APP_VERSION}]`);
});