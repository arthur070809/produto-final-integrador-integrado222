const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── LISTAR TODAS AS VOLTAS ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [voltas] = await connection.query('SELECT * FROM voltas ORDER BY data DESC');
        connection.release();

        res.json(voltas);

    } catch (err) {
        console.error('Erro ao listar voltas:', err);
        res.status(500).json({ error: 'Erro ao listar voltas' });
    }
});

// ─── CRIAR VOLTA ──────────────────────────────────────────────────────────────
router.post('/create', async (req, res) => {
    try {
        const { tempo, data, corredores_id, corrida_num } = req.body;

        if (!tempo || !corredores_id || !corrida_num) {
            return res.status(400).json({ error: 'Tempo, corredores_id e corrida_num são obrigatórios' });
        }

        // 🛠️ TRATAMENTO SEGURO DA STRING DE DATA
        let dataFormatada;
        if (data && typeof data === 'string') {
            // Remove o 'T', o 'Z' e os milissegundos, deixando no formato do MySQL: YYYY-MM-DD HH:MM:SS
            dataFormatada = data.replace('T', ' ').slice(0, 19);
        } else {
            dataFormatada = new Date().toISOString().replace('T', ' ').slice(0, 19);
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO voltas (tempo, data, corredores_id, corrida_num) VALUES (?, ?, ?, ?)',
            [tempo, dataFormatada, corredores_id, corrida_num]
        );
        connection.release();

        res.json({ success: true, id: result.insertId });

    } catch (err) {
        console.error('Erro ao criar volta:', err);
        res.status(500).json({ error: 'Erro ao criar volta' });
    }
});

// ─── MÉDIAS POR CORREDOR ──────────────────────────────────────────────────────
router.get('/medias', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        // Todas as voltas agrupadas por corredor
        const [allLaps] = await connection.query(`
            SELECT 
                corredores_id as id,
                corrida_num,
                COUNT(*) as total_voltas,
                AVG(CAST(tempo AS DECIMAL(10,2))) as media_tempo,
                MIN(CAST(tempo AS DECIMAL(10,2))) as melhor_tempo,
                MAX(CAST(tempo AS DECIMAL(10,2))) as pior_tempo
            FROM voltas
            GROUP BY corredores_id, corrida_num
            ORDER BY corredores_id, corrida_num
        `);

        // Média geral por corredor
        const [generalStats] = await connection.query(`
            SELECT 
                corredores_id as id,
                COUNT(*) as total_voltas,
                AVG(CAST(tempo AS DECIMAL(10,2))) as media_geral,
                MIN(CAST(tempo AS DECIMAL(10,2))) as melhor_tempo
            FROM voltas
            GROUP BY corredores_id
            ORDER BY corredores_id
        `);

        connection.release();

        // Formata resposta
        const result = generalStats.map(stats => {
            const corridas = allLaps.filter(lap => lap.id === stats.id);
            return {
                id: stats.id,
                geral: {
                    total_voltas: stats.total_voltas,
                    media_geral: parseFloat(stats.media_geral).toFixed(2),
                    melhor_tempo: parseFloat(stats.melhor_tempo).toFixed(2)
                },
                corridas: corridas.map(c => ({
                    corrida_num: c.corrida_num,
                    total_voltas: c.total_voltas,
                    media_tempo: parseFloat(c.media_tempo).toFixed(2),
                    melhor_tempo: parseFloat(c.melhor_tempo).toFixed(2),
                    pior_tempo: parseFloat(c.pior_tempo).toFixed(2)
                }))
            };
        });

        res.json(result);

    } catch (err) {
        console.error('Erro ao calcular médias:', err);
        res.status(500).json({ error: 'Erro ao calcular médias' });
    }
});

module.exports = router;