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

// Define routes
// עדכון הנתיב my-app
app.get('/my-app', (req, res) => {
    helloWorldCounter.inc();
    res.json({
        message: 'Hello, World!',
        environment: APP_ENV,
        logLevel: LOG_LEVEL,
        version: APP_VERSION
    });
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