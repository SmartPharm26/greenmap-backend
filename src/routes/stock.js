const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// GET /api/stock/:pharmacyId - Obtenir le stock d'une pharmacie
router.get('/:pharmacyId', async (req, res) => {
    try {
        const { pharmacyId } = req.params;
        const { data, error } = await supabase
            .from('stocks')
            .select(`
                id,
                quantity,
                unit_price,
                expiry_date,
                batch_number,
                alert_threshold,
                product:products(id, cip_code, name, generic_name, category, dosage, form, requires_prescription)
            `)
            .eq('pharmacy_id', pharmacyId);

        if (error) throw error;
        return res.json({ success: true, count: data.length, data });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/stock - Ajouter ou mettre à jour un produit en stock
router.post('/', async (req, res) => {
    try {
        const { pharmacy_id, product_id, quantity, unit_price, expiry_date, batch_number } = req.body;

        const { data, error } = await supabase
            .from('stocks')
            .upsert({
                pharmacy_id,
                product_id,
                quantity,
                unit_price,
                expiry_date,
                batch_number,
                updated_at: new Date()
            }, { onConflict: 'pharmacy_id,product_id' })
            .select();

        if (error) throw error;
        return res.status(200).json({ success: true, data: data[0] });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
