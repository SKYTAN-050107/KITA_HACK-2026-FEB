// backend/src/routes/guidelinesRoutes.js — Static guidelines content

const express = require('express');
const router = express.Router();
const { WASTE_RULES } = require('../config/wasteRulesBackend');

/**
 * GET /api/v1/guidelines
 * Return waste disposal guidelines as structured JSON tabs.
 */
router.get('/guidelines', async (req, res) => {
    try {
        const tabs = Object.entries(WASTE_RULES).map(([key, rule]) => ({
            id: key,
            label: rule.displayName,
            icon: rule.icon,
            category: rule.category,
            disposalMethod: rule.disposalMethod,
            color: rule.correctBin.color,
            content: {
                correctBin: rule.correctBin,
                shortRules: rule.shortRules,
                checklist: rule.checklist,
            },
        }));

        res.json({
            success: true,
            tabs,
        });
    } catch (err) {
        console.error('Guidelines error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch guidelines' });
    }
});

module.exports = router;
