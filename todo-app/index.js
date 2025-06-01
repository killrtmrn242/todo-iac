require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const client = require('prom-client'); // ← ВАЖНО: сначала импорт

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// === Настройка Prometheus метрик ===
const register = new client.Registry();
register.setDefaultLabels({ app: 'todo-api' });
client.collectDefaultMetrics({ register });

// Счётчик запросов
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Общее количество HTTP-запросов',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Гистограмма длительности запросов
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Длительность HTTP-запросов в миллисекундах',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 300, 500, 1000, 2000, 5000] // В миллисекундах
});
register.registerMetric(httpRequestDuration);

// Middleware для сбора метрик
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    httpRequestCounter.labels(req.method, req.path, res.statusCode.toString()).inc();
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });

  next();
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB подключена"))
.catch(err => console.error("❌ Ошибка подключения MongoDB:", err));

app.use('/api/tasks', (req, res, next) => {
  if (req.query.test_error === 'true') {
    return res.status(500).send('Test error');
  }
  next();
});


// Роуты задач
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Роут для /metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
