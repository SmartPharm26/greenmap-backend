const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// POST /api/sales - Enregistrer une nouvelle vente en caisse POS
router.post('/', async (req, res) => {
    try {
        const { pharmacy_id, pharmacist_id, items, payment_method, customer_phone, payment_reference } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'La vente doit contenir au moins un article' });
        }

        // 1. Calculer le total
        const total_amount = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

        // 2. Insérer la vente
        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert([{
                pharmacy_id,
                pharmacist_id,
                total_amount,
                payment_method: payment_method || 'cash',
                payment_reference,
                payment_status: 'completed',
                customer_phone
            }])
            .select();

        if (saleError) throw saleError;
        const saleId = saleData[0].id;

        // 3. Insérer les articles de la vente
        const saleItems = items.map(item => ({
            sale_id: saleId,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.unit_price * item.quantity
        }));

        const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
        if (itemsError) throw itemsError;

        // 4. Décrémenter le stock local pour chaque produit
        for (const item of items) {
            // Récupérer la quantité actuelle
            const { data: currentStock } = await supabase
                .from('stocks')
                .select('quantity')
                .eq('pharmacy_id', pharmacy_id)
                .eq('product_id', item.product_id)
                .single();

            if (currentStock) {
                const newQty = Math.max(0, currentStock.quantity - item.quantity);
                await supabase
                    .from('stocks')
                    .update({ quantity: newQty, updated_at: new Date() })
                    .eq('pharmacy_id', pharmacy_id)
                    .eq('product_id', item.product_id);
            }
        }

        return res.status(201).json({ success: true, sale_id: saleId, total_amount });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
