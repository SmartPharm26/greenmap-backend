const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// GET /api/pharmacies - Liste toutes les pharmacies (avec filtres ville / garde)
router.get('/', async (req, res) => {
    try {
        const { city, verified_only } = req.query;
        let query = supabase.from('pharmacies').select('*');

        if (city) {
            query = query.ilike('city', `%${city}%`);
        }
        if (verified_only === 'true') {
            query = query.eq('is_verified', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.json({ success: true, count: data.length, data });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/pharmacies - Créer une nouvelle pharmacie
router.post('/', async (req, res) => {
    try {
        const { name, address, city, country, phone, whatsapp, latitude, longitude, license_number } = req.body;

        const { data, error } = await supabase
            .from('pharmacies')
            .insert([{ name, address, city, country: country || 'TG', phone, whatsapp, latitude, longitude, license_number }])
            .select();

        if (error) throw error;
        return res.status(201).json({ success: true, data: data[0] });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

// PATCH /api/pharmacies/:id/verify - Valider une pharmacie (Admin)
router.patch('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        const { data, error } = await supabase
            .from('pharmacies')
            .update({ is_verified, updated_at: new Date() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return res.json({ success: true, data: data[0] });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
