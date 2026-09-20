const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/payments/initiate - Initier un paiement Mobile Money (FedaPay / KKiaPay)
router.post('/initiate', async (req, res) => {
    try {
        const { amount, phone, provider, customer_name } = req.body;

        // FedaPay API / KKiaPay integration placeholder
        const fedapaySecret = process.env.FEDAPAY_SECRET_KEY;

        if (!fedapaySecret) {
            // Mode simulation si pas de clé configurée
            return res.json({
                success: true,
                simulated: true,
                payment_id: `SIM_${Date.now()}`,
                status: 'pending',
                message: `Paiement simulé de ${amount} FCFA vers le numéro ${phone} (${provider})`
            });
        }

        // Appel à FedaPay API
        const response = await axios.post('https://api.fedapay.com/v1/transactions', {
            description: 'Paiement Pharmacie GreenMap',
            amount,
            currency: { iso: 'XOF' },
            callback_url: 'https://yourdomain.com/api/payments/webhook',
            customer: { firstname: customer_name || 'Client', phone_number: { number: phone, country: 'tg' } }
        }, {
            headers: { Authorization: `Bearer ${fedapaySecret}` }
        });

        return res.json({ success: true, transaction: response.data });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/payments/webhook - Revoir la confirmation du paiement Mobile Money
router.post('/webhook', (req, res) => {
    const event = req.body;
    console.log('Webhook Paiement reçu :', event);

    // Traitement selon l'événement (ex: transaction.approved)
    return res.status(200).send('OK');
});

module.exports = router;
