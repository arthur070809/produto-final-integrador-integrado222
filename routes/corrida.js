const express = require('express');
const router = express.Router();

// ─── ESTADO DA CORRIDA ────────────────────────────────────────────────────────
router.get('/estado', (req, res) => {
    try {
        const estado = req.app.locals.corrida.getEstado();
        res.json(estado);
    } catch (err) {
        console.error('Erro:', err);
        res.status(500).json({ error: 'Erro ao obter estado' });
    }
});

// ─── INICIAR CORRIDA ──────────────────────────────────────────────────────────
router.post('/iniciar', async (req, res) => {
    try {
        const { corredores } = req.body;
        
        if (!corredores || corredores.length === 0) {
            return res.status(400).json({ error: 'Corredores são obrigatórios' });
        }

        req.app.locals.corrida.iniciar(corredores);
        res.json({ success: true });

    } catch (err) {
        console.error('Erro:', err);
        res.status(500).json({ error: 'Erro ao iniciar corrida' });
    }
});

// ─── REGISTRAR CHEGADA ────────────────────────────────────────────────────────
router.post('/chegada/:corredorId', (req, res) => {
    try {
        const { corredorId } = req.params;
        const tempo = req.app.locals.corrida.registrarChegada(parseInt(corredorId));

        if (tempo === null) {
            return res.status(400).json({ error: 'Corredor não encontrado ou já finalizou' });
        }

        res.json({ success: true, tempo });

    } catch (err) {
        console.error('Erro:', err);
        res.status(500).json({ error: 'Erro ao registrar chegada' });
    }
});

// ─── ENCERRAR CORRIDA ─────────────────────────────────────────────────────────
router.post('/encerrar', (req, res) => {
    try {
        req.app.locals.corrida.encerrar();
        res.json({ success: true });

    } catch (err) {
        console.error('Erro:', err);
        res.status(500).json({ error: 'Erro ao encerrar corrida' });
    }
});

module.exports = router;