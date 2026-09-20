const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const pharmaciesRoutes = require('./routes/pharmacies');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const paymentsRoutes = require('./routes/payments');
const guardsRoutes = require('./routes/guards');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'GreenMap Pharma Backend', timestamp: new Date() });
});

// Enregistrement des Routes API
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/guards', guardsRoutes);

// Gestionnaire des erreurs 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route non trouvée' });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur backend GreenMap démarré sur http://localhost:${PORT}`);
});
