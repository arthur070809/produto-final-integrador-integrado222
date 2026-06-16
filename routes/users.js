const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'seu_secret_key_aqui_mude_em_producao';

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const connection = await pool.getConnection();
        const [users] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        connection.release();

        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Atualiza último login e total de logins
        const conn = await pool.getConnection();
        await conn.query(
            'UPDATE usuarios SET ultimo_login = NOW(), total_logins = total_logins + 1 WHERE id = ?',
            [user.id]
        );
        conn.release();

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// ─── REGISTRO ────────────────────────────────────────────────────────────────
router.post('/create', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await connection.query(
            'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, 'user']
        );

        connection.release();

        res.json({ success: true, message: 'Usuário criado com sucesso' });

    } catch (err) {
        console.error('Erro no registro:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// ─── LISTAR USUÁRIOS (para admin) ────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query('SELECT id, nome, email, role, ultimo_login, total_logins FROM usuarios');
        connection.release();

        res.json(users);

    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

module.exports = router;