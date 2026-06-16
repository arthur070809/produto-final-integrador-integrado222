const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── LISTAR CORREDORES ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [corredores] = await connection.query('SELECT * FROM corredores');
        connection.release();

        res.json(corredores);

    } catch (err) {
        console.error('Erro ao listar corredores:', err);
        res.status(500).json({ error: 'Erro ao listar corredores' });
    }
});

// ─── OBTER CORREDOR POR ID ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [corredores] = await connection.query('SELECT * FROM corredores WHERE id = ?', [id]);
        connection.release();

        if (corredores.length === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado' });
        }

        res.json(corredores[0]);

    } catch (err) {
        console.error('Erro ao buscar corredor:', err);
        res.status(500).json({ error: 'Erro ao buscar corredor' });
    }
});

module.exports = router;