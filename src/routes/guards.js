const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// GET /api/guards - Récupérer les pharmacies de garde actives pour une ville donnée
router.get('/', async (req, res) => {
    try {
        const { city } = req.query;
        const now = new Date().toISOString();

        let query = supabase
            .from('guard_schedules')
            .select(`
                id,
                start_date,
                end_date,
                city,
                zone,
                pharmacy:pharmacies(id, name, address, phone, whatsapp, latitude, longitude, city)
            `)
            .lte('start_date', now)
            .gte('end_date', now);

        if (city) {
            query = query.ilike('city', `%${city}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.json({ success: true, count: data.length, data });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/guards - Ajouter un planning de garde (Super-Admin)
router.post('/', async (req, res) => {
    try {
        const { pharmacy_id, start_date, end_date, city, zone } = req.body;

        const { data, error } = await supabase
            .from('guard_schedules')
            .insert([{ pharmacy_id, start_date, end_date, city, zone }])
            .select();

        if (error) throw error;
        return res.status(201).json({ success: true, data: data[0] });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
