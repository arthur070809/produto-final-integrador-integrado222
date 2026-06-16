document.addEventListener("DOMContentLoaded", async () => {

    const API_URL = 'http://localhost:3000';

    function showError(containerId, message) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `<p class="dash-error">⚠️ ${message}</p>`;
    }

    // ─── KPIs ─────────────────────────────────────────────────────────────────
    async function renderKPIs() {
        try {
            const [voltasRes, corredoresRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`)
            ]);

            const voltas = await voltasRes.json();
            const corredores = await corredoresRes.json();

            const tempos = voltas.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));
            const melhorTempo = tempos.length ? Math.min(...tempos).toFixed(2) + 's' : '—';

            // Número de corridas distintas já realizadas
            // Corredor com menor tempo
            const melhorCorredor = corredores.map(c => {
                const temposCorredor = voltas
                    .filter(v => String(v.corredores_id) === String(c.id))
                    .map(v => parseFloat(v.tempo))
                    .filter(t => !isNaN(t));
                const melhor = temposCorredor.length ? Math.min(...temposCorredor) : Infinity;
                return { nome: c.nome, melhor };
            }).sort((a, b) => a.melhor - b.melhor)[0];

            document.getElementById("kpi-position").textContent = `${1}`;
            document.getElementById("kpi-points").textContent = melhorTempo;
            document.getElementById("kpi-podiums").textContent = melhorCorredor ? melhorCorredor.nome : '—';
            document.getElementById("kpi-laps").textContent = `${8}`;

            document.querySelectorAll(".kpi-card").forEach(c => c.classList.remove("loading"));
        } catch (err) {
            console.error("[Dashboard] Erro KPIs:", err);
            showError("kpi-section", "Não foi possível carregar os KPIs.");
        }
    }

    // ─── TABELA DE RESULTADOS ─────────────────────────────────────────────────
    async function renderRaceResults() {
        try {
            const [voltasRes, corredoresRes, usuariosRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`),
                fetch(`${API_URL}/usuarios`)
            ]);

            const voltas = await voltasRes.json();
            const todosCorredores = await corredoresRes.json();
            const usuarios = await usuariosRes.json();

            const adminsIds = new Set(usuarios.filter(u => u.role === 'admin').map(u => u.id));
            const corredores = todosCorredores.filter(c => !adminsIds.has(c.usuario_id));

            const tbody = document.getElementById("results-tbody");
            if (!tbody) return;

            if (!voltas.length) {
                tbody.innerHTML = `<tr><td colspan="5" class="loading-row">Nenhuma volta registrada.</td></tr>`;
                return;
            }

            // Agrupa melhor tempo por corrida e corredor
            const corridasMap = {};
            voltas.forEach(v => {
                const num = v.corrida_num || 1;
                if (!corridasMap[num]) corridasMap[num] = {};
                const tempoAtual = parseFloat(v.tempo);
                if (!corridasMap[num][v.corredores_id] || tempoAtual < corridasMap[num][v.corredores_id].melhor) {
                    if (!corridasMap[num][v.corredores_id]) corridasMap[num][v.corredores_id] = {};
                    corridasMap[num][v.corredores_id].melhor = tempoAtual;
                    corridasMap[num][v.corredores_id].data = v.data;
                }
            });

            // Atualiza cabeçalho com nome de cada corredor
            const thead = document.querySelector("#results-section thead tr");
            if (thead) {
                thead.innerHTML = `
                    <th>#</th>
                    <th>Data</th>
                    ${corredores.map(c => `<th>${c.nome}</th>`).join('')}
                    <th>Melhor Tempo</th>
                `;
            }

            const numsCorrida = Object.keys(corridasMap).map(Number).sort((a, b) => a - b);

            tbody.innerHTML = numsCorrida.map(num => {
                const corrida = corridasMap[num];
                const dataRef = Object.values(corrida)[0]?.data;
                const dataFmt = dataRef ? new Date(dataRef).toLocaleDateString('pt-BR') : '—';

                const todos = Object.values(corrida).map(c => c.melhor).filter(t => !isNaN(t));
                const melhor = todos.length ? Math.min(...todos).toFixed(2) + 's' : '—';

                // Soma total de cada corredor nesta corrida
                const celulas = corredores.map(c => {
                    const dado = corrida[c.id];
                    return `<td class="td-points">${dado ? dado.melhor.toFixed(2) + 's' : '—'}</td>`;
                }).join('');

                return `
                    <tr>
                        <td class="td-round">${num}</td>
                        <td class="td-gp"><span class="gp-name-cell">${dataFmt}</span></td>
                        ${celulas}
                        <td class="td-points td-best">${melhor}</td>
                    </tr>
                `;
            }).join('');

            // ── Linha de SOMA TOTAL ──────────────────────────────────────────
            const somaRow = corredores.map(c => {
                const somaTotal = voltas
                    .filter(v => String(v.corredores_id) === String(c.id))
                    .reduce((acc, v) => acc + parseFloat(v.tempo), 0);
                return `<td class="td-points" style="color:#a855f7; font-weight:700;">
                    ${somaTotal > 0 ? somaTotal.toFixed(2) + 's' : '—'}
                </td>`;
            }).join('');

            tbody.innerHTML += `
                <tr style="border-top: 2px solid #a855f7;">
                    <td class="td-round" style="color:#a855f7; font-weight:700;">Σ</td>
                    <td class="td-gp" style="color:#a855f7; font-weight:700;">Soma Total</td>
                    ${somaRow}
                    <td class="td-points td-best">—</td>
                </tr>
            `;

        } catch (err) {
            console.error("[Dashboard] Erro resultados:", err);
            showError("results-section", "Não foi possível carregar os resultados.");
        }
    }

    // ─── RANKING (STANDINGS) ──────────────────────────────────────────────────
    async function renderStandings() {
        try {
            const [voltasRes, corredoresRes, usuariosRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`),
                fetch(`${API_URL}/usuarios`)
            ]);

            const voltas = await voltasRes.json();
            const todosCorredores = await corredoresRes.json();
            const usuarios = await usuariosRes.json();

            const adminsIds = new Set(usuarios.filter(u => u.role === 'admin').map(u => u.id));
            const corredores = todosCorredores.filter(c => !adminsIds.has(c.usuario_id));

            const container = document.getElementById("standings-list");
            if (!container) return;

            if (!corredores.length) {
                container.innerHTML = `<p class="loading-row">Nenhum corredor cadastrado.</p>`;
                return;
            }

            const ranking = corredores.map(c => {
                const minhasVoltas = voltas.filter(v => v.corredores_id === c.id);
                const tempos = minhasVoltas.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));
                const melhor = tempos.length ? Math.min(...tempos) : Infinity;
                const media = tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : null;
                return { ...c, melhorTempo: melhor, totalVoltas: minhasVoltas.length, mediaTempo: media };
            }).sort((a, b) => a.melhorTempo - b.melhorTempo);

            container.innerHTML = ranking.map((c, i) => `
                <div class="standing-item">
                    <span class="standing-pos">${i + 1}</span>
                    <div class="standing-info">
                        <span class="standing-name">${c.nome}</span>
                        <span class="standing-sub">
                            ${c.turma || '—'} · ${c.totalVoltas} volta${c.totalVoltas !== 1 ? 's' : ''}
                            ${c.mediaTempo ? ` · Média: ${c.mediaTempo.toFixed(2)}s` : ''}
                        </span>
                    </div>
                    <span class="standing-time">
                        ${c.melhorTempo !== Infinity ? c.melhorTempo.toFixed(2) + 's' : '—'}
                    </span>
                </div>
            `).join('');

        } catch (err) {
            console.error("[Dashboard] Erro standings:", err);
            showError("standings-section", "Não foi possível carregar o ranking.");
        }
    }

    // ─── COMPARATIVO DE CORREDORES ────────────────────────────────────────────
    async function renderDriverComparison() {
        try {
            const [voltasRes, corredoresRes, usuariosRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`),
                fetch(`${API_URL}/usuarios`)
            ]);

            const voltas = await voltasRes.json();
            const todosCorredores = await corredoresRes.json();
            const usuarios = await usuariosRes.json();

            const adminsIds = new Set(usuarios.filter(u => u.role === 'admin').map(u => u.id));
            const corredores = todosCorredores.filter(c => !adminsIds.has(c.usuario_id));

            const container = document.getElementById("driver-comparison");
            if (!container) return;

            if (!corredores.length) {
                container.innerHTML = `<p class="loading-row">Nenhum corredor cadastrado.</p>`;
                return;
            }

            const stats = corredores.map(c => {
                const minhasVoltas = voltas.filter(v => v.corredores_id === c.id);
                const tempos = minhasVoltas.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));
                const melhor = tempos.length ? Math.min(...tempos).toFixed(2) : null;
                const media = tempos.length ? (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(2) : null;
                return { ...c, totalVoltas: minhasVoltas.length, melhorTempo: melhor, mediaTempo: media };
            });

            container.innerHTML = `
    <table class="results-table" style="width:100%; margin-top: 1rem;">
        <thead>
            <tr>
                <th>Corredor</th>
                <th>Turma</th>
                <th>Total de Voltas</th>
                <th>Melhor Tempo</th>
                <th>Tempo Médio</th>
            </tr>
        </thead>
        <tbody>
            ${stats.map(s => `
                <tr>
                    <td>${s.nome}</td>
                    <td>${s.turma || '—'}</td>
                    <td>${s.totalVoltas}</td>
                    <td>${s.melhorTempo ? s.melhorTempo + 's' : '—'}</td>
                    <td>${s.mediaTempo ? s.mediaTempo + 's' : '—'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
`;

        } catch (err) {
            console.error("[Dashboard] Erro comparativo:", err);
            showError("comparison-section", "Não foi possível carregar o comparativo.");
        }
    }

    await Promise.allSettled([
        renderKPIs(),
        renderRaceResults(),
        renderStandings(),
        renderDriverComparison()
    ]);

    const tsEl = document.getElementById("last-updated");
    if (tsEl) tsEl.textContent = new Date().toLocaleString("pt-BR");
});

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL — TEMPOS DE VOLTA DO USUÁRIO LOGADO
// ═══════════════════════════════════════════════════════════════════════════════

const API_URL = 'http://localhost:3000';

// Número da corrida selecionada no modal (1–8)
let corridaSelecionada = 1;

async function openLapTimesModal() {
    const modal = document.getElementById('lap-times-modal');
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';

    let usuario = null;
    try {
        const raw = localStorage.getItem('usuario');
        usuario = raw ? JSON.parse(raw) : null;
    } catch (e) { usuario = null; }

    if (!usuario || !usuario.id) {
        document.getElementById('modal-user-label').textContent = 'Nenhum usuário logado';
        document.getElementById('modal-tbody').innerHTML =
            `<tr><td colspan="4" class="dash-error">⚠️ Faça login para ver seus tempos.</td></tr>`;
        resetModalStats();
        return;
    }

    document.getElementById('modal-user-label').textContent =
        `Piloto: ${usuario.nome || usuario.email || 'Usuário #' + usuario.id}`;

    await carregarModalCompleto(usuario);
}

// ─── Carrega voltas + médias do usuário ───────────────────────────────────────
async function carregarModalCompleto(usuario) {
    document.getElementById('modal-tbody').innerHTML =
        `<tr><td colspan="4" class="loading-row">Carregando voltas...</td></tr>`;
    resetModalStats();

    try {
        // Busca o corredores_id correto via API para evitar dados desatualizados no localStorage
        let corredorId = usuario.corredores_id;

        if (!corredorId) {
            // Tenta buscar pelo usuario_id na lista de corredores
            const corrRes = await fetch(`${API_URL}/corredores`);
            const corredores = await corrRes.json();
            const meu = corredores.find(c => String(c.usuario_id) === String(usuario.id));
            if (meu) {
                corredorId = meu.id;
                // Atualiza localStorage para as próximas vezes
                usuario.corredores_id = corredorId;
                localStorage.setItem('usuario', JSON.stringify(usuario));
            }
        }

        if (!corredorId) {
            document.getElementById('modal-tbody').innerHTML =
                `<tr><td colspan="4" class="dash-error">⚠️ Corredor não encontrado para este usuário.</td></tr>`;
            return;
        }

        // Busca voltas e médias em paralelo
        const [voltasRes, mediasRes] = await Promise.all([
            fetch(`${API_URL}/voltas`),
            fetch(`${API_URL}/voltas/medias`)
        ]);

        const todasVoltas = await voltasRes.json();
        const medias = await mediasRes.json();

        const minhasVoltas = todasVoltas.filter(v =>
            String(v.corredores_id) === String(corredorId)
        );

        // Renderiza seletor de corridas
        renderCorridas(minhasVoltas, corredorId);

        // Renderiza médias gerais
        const meusDados = medias.find(m => String(m.id) === String(corredorId));
        renderMediasSection(meusDados);

        // Renderiza tabela da corrida selecionada
        const voltasDaCorrida = minhasVoltas.filter(v => v.corrida_num === corridaSelecionada);
        renderModalStats(minhasVoltas, voltasDaCorrida);
        renderModalTable(voltasDaCorrida);

    } catch (err) {
        console.error('[Modal] Erro ao buscar voltas:', err);
        document.getElementById('modal-tbody').innerHTML =
            `<tr><td colspan="4" class="dash-error">⚠️ Não foi possível carregar os tempos.</td></tr>`;
    }
}

// ─── Renderiza os botões de seleção de corrida ────────────────────────────────
function renderCorridas(voltas, corredorId) {
    const container = document.getElementById('modal-corridas');
    if (!container) return;

    const corridasComVoltas = new Set(voltas.map(v => v.corrida_num));

    container.innerHTML = Array.from({ length: 8 }, (_, i) => i + 1).map(num => {
        const temVoltas = corridasComVoltas.has(num);
        const ativo = num === corridaSelecionada ? 'corrida-btn--active' : '';
        const comDados = temVoltas ? 'corrida-btn--has-data' : '';
        return `
            <button class="corrida-btn ${ativo} ${comDados}"
                    onclick="selecionarCorrida(${num}, '${corredorId}')">
                C${num}
            </button>
        `;
    }).join('');
}

// ─── Troca corrida selecionada e recarrega tabela ─────────────────────────────
async function selecionarCorrida(num, corredorId) {
    corridaSelecionada = num;

    // Atualiza botões
    document.querySelectorAll('.corrida-btn').forEach((btn, i) => {
        btn.classList.toggle('corrida-btn--active', i + 1 === num);
    });

    try {
        const voltasRes = await fetch(`${API_URL}/voltas`);
        const todasVoltas = await voltasRes.json();

        const minhasVoltas = todasVoltas.filter(v => String(v.corredores_id) === String(corredorId));
        const voltasDaCorrida = minhasVoltas.filter(v => v.corrida_num === num);

        renderModalStats(minhasVoltas, voltasDaCorrida);
        renderModalTable(voltasDaCorrida);
    } catch (err) {
        console.error('[Modal] Erro ao trocar corrida:', err);
    }
}

// ─── Seção de médias gerais ───────────────────────────────────────────────────
function renderMediasSection(dados) {
    const container = document.getElementById('modal-medias');
    if (!container) return;

    if (!dados || !dados.geral || dados.geral.total_voltas === 0) {
        container.innerHTML = `<p class="loading-row" style="font-size:0.8rem;">Sem dados de média ainda.</p>`;
        return;
    }

    const g = dados.geral;

    // Monta linha por corrida
    const corridasHtml = dados.corridas.map(c => {
        const soma = (parseFloat(c.media_tempo) * c.total_voltas).toFixed(2);
        return `
        <div class="media-corrida-item">
            <span class="media-corrida-num">C${c.corrida_num}</span>
            <span class="media-corrida-val">Média: <strong>${c.media_tempo}s</strong></span>
            <span class="media-corrida-val">Melhor: <strong>${c.melhor_tempo}s</strong></span>
            <span class="media-corrida-val">Soma: <strong>${soma}s</strong></span>
            <span class="media-corrida-val">${c.total_voltas} volta${c.total_voltas !== 1 ? 's' : ''}</span>
        </div>
    `;
    }).join('');

    const somaGeral = (parseFloat(g.media_geral) * g.total_voltas).toFixed(2);

    container.innerHTML = `
        <div class="medias-geral">
            <span>📊 Média Geral: <strong>${g.media_geral}s</strong></span>
            <span>🏆 Melhor Geral: <strong>${g.melhor_tempo}s</strong></span>
            <span>⏱️ Soma Geral: <strong>${somaGeral}s</strong></span>
            <span>🔢 Total: <strong>${g.total_voltas} volta${g.total_voltas !== 1 ? 's' : ''}</strong></span>
        </div>
        <div class="medias-corridas">${corridasHtml}</div>
    `;
}

// ─── Stats do modal ───────────────────────────────────────────────────────────
function resetModalStats() {
    ['mstat-total', 'mstat-best', 'mstat-avg', 'mstat-last', 'mstat-soma'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
    });
    const badge = document.getElementById('modal-lap-count');
    if (badge) badge.textContent = '0 voltas';
}

// minhasVoltas = todas as voltas do corredor; voltasDaCorrida = só da corrida atual
function renderModalStats(minhasVoltas, voltasDaCorrida) {
    const badge = document.getElementById('modal-lap-count');
    if (badge) badge.textContent = `${voltasDaCorrida.length} volta${voltasDaCorrida.length !== 1 ? 's' : ''} na corrida ${corridaSelecionada}`;

    document.getElementById('mstat-total').textContent = minhasVoltas.length;

    if (!voltasDaCorrida.length) {
        ['mstat-best', 'mstat-avg', 'mstat-last'].forEach(id => {
            document.getElementById(id).textContent = '—';
        });
        return;
    }

    const tempos = voltasDaCorrida.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));
    const melhor = Math.min(...tempos);
    const soma = tempos.reduce((a, b) => a + b, 0);
    const media = soma / tempos.length;
    const sorted = [...voltasDaCorrida].sort((a, b) => new Date(b.data) - new Date(a.data));
    const ultimo = parseFloat(sorted[0].tempo);

    document.getElementById('mstat-best').textContent = `${melhor.toFixed(2)}s`;
    document.getElementById('mstat-avg').textContent = `${media.toFixed(2)}s`;
    document.getElementById('mstat-last').textContent = `${ultimo.toFixed(2)}s`;
    document.getElementById('mstat-soma').textContent = `${soma.toFixed(2)}s`;
}

function renderModalTable(voltas) {
    const tbody = document.getElementById('modal-tbody');
    if (!tbody) return;

    if (!voltas.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="loading-row">Nenhuma volta registrada nesta corrida.</td></tr>`;
        return;
    }

    const sorted = [...voltas].sort((a, b) => new Date(b.data) - new Date(a.data));
    const tempos = sorted.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));
    const melhor = Math.min(...tempos);

    tbody.innerHTML = sorted.map((v, i) => {
        const tempo = parseFloat(v.tempo);
        const isBest = tempo === melhor;
        const dataFmt = new Date(v.data).toLocaleDateString('pt-BR');

        let statusHtml = '';
        if (isBest) statusHtml = `<span class="lap-badge lap-badge--best">🏆 Melhor</span>`;
        else if (i === 0) statusHtml = `<span class="lap-badge lap-badge--recent">🕐 Recente</span>`;
        else statusHtml = `<span class="lap-badge lap-badge--normal">✓</span>`;

        return `
            <tr class="${isBest ? 'row-best-lap' : ''}">
                <td class="td-round">${sorted.length - i}</td>
                <td>${dataFmt}</td>
                <td class="td-points ${isBest ? 'td-best' : ''}">${tempo.toFixed(2)}s</td>
                <td>${statusHtml}</td>
            </tr>
        `;
    }).join('');
}

// ─── Registrar volta (na corrida selecionada) ─────────────────────────────────
async function registrarVolta() {
    let usuario = null;
    try {
        const raw = localStorage.getItem('usuario');
        usuario = raw ? JSON.parse(raw) : null;
    } catch (e) { usuario = null; }

    if (!usuario || !usuario.id) {
        alert('Faça login para registrar uma volta.');
        return;
    }

    // Garante corredores_id atualizado
    let corredorId = usuario.corredores_id;
    if (!corredorId) {
        try {
            const corrRes = await fetch(`${API_URL}/corredores`);
            const corredores = await corrRes.json();
            const meu = corredores.find(c => String(c.usuario_id) === String(usuario.id));
            if (meu) {
                corredorId = meu.id;
                usuario.corredores_id = corredorId;
                localStorage.setItem('usuario', JSON.stringify(usuario));
            }
        } catch (e) { }
    }

    if (!corredorId) {
        alert('Corredor não encontrado para este usuário. Contate o administrador.');
        return;
    }

    const tempo = (Math.random() * (120 - 60) + 60).toFixed(2);

    try {
        const res = await fetch(`${API_URL}/voltas/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            tempo,
            data: new Date().toISOString().slice(0, 19).replace('T', ' '), 
            corredores_id: corredorId,
            corrida_num: corridaSelecionada 
})
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Erro ao registrar volta');
        }

        // Recarrega tudo no modal
        await carregarModalCompleto(usuario);

    } catch (err) {
        console.error('[Modal] Erro ao registrar volta:', err);
        alert(`Não foi possível registrar a volta: ${err.message}`);
    }
}

// ─── Fechar modal ─────────────────────────────────────────────────────────────
function closeLapTimesModal(event) {
    if (event && event.target !== document.getElementById('lap-times-modal')) return;
    const modal = document.getElementById('lap-times-modal');
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('lap-times-modal');
        if (modal && modal.classList.contains('modal--open')) {
            modal.classList.remove('modal--open');
            document.body.style.overflow = '';
        }
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL — REGISTRAR TEMPOS DE VOLTA (NOVO)
// ═══════════════════════════════════════════════════════════════════════════════

async function abrirRegistroTempo() {
    const modal = document.getElementById('register-times-modal');
    if (!modal) return;
    
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
    
    // Carrega lista de corredores
    try {
        const res = await fetch(`${API_URL}/corredores`);
        const corredores = await res.json();
        
        const container = document.getElementById('pilotos-tempos');
        if (container) {
            container.innerHTML = corredores.map((c, idx) => `
                <div class="piloto-tempo-item">
                    <label>${c.nome}</label>
                    <input type="number" 
                           class="piloto-tempo-input form-control" 
                           data-corredor-id="${c.id}" 
                           placeholder="ex: 71.45" 
                           step="0.01" 
                           min="0">
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('[Registro] Erro ao carregar corredores:', err);
    }
}

function fecharRegistroTempo(event) {
    if (event && event.target !== document.getElementById('register-times-modal')) return;
    const modal = document.getElementById('register-times-modal');
    if (modal) {
        modal.classList.remove('modal--open');
        document.body.style.overflow = '';
    }
}

async function salvarTempos() {
    try {
        const corridaNum = parseInt(document.getElementById('register-corrida').value);
        
        if (!corridaNum || corridaNum < 1 || corridaNum > 8) {
            alert('Selecione um número de corrida válido (1-8)');
            return;
        }
        
        const inputs = document.querySelectorAll('.piloto-tempo-input');
        const temposParaSalvar = [];
        
        inputs.forEach(input => {
            const corredorId = parseInt(input.dataset.corredorId);
            const tempo = parseFloat(input.value);
            
            if (tempo && !isNaN(tempo) && tempo > 0) {
                temposParaSalvar.push({ corredorId, tempo, corridaNum });
            }
        });
        
        if (temposParaSalvar.length === 0) {
            alert('Insira pelo menos um tempo válido');
            return;
        }
        
        let sucessos = 0;
        for (const dados of temposParaSalvar) {
            const res = await fetch(`${API_URL}/voltas/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                tempo: dados.tempo.toFixed(2),
                data: new Date().toISOString().slice(0, 19).replace('T', ' '),
                corredores_id: dados.corredorId,
                corrida_num: dados.corridaNum
})
            });
            
            const json = await res.json();
            if (res.ok) {
                sucessos++;
            } else {
                console.error('[Registro] Erro:', json.error);
            }
        }
        
        if (sucessos > 0) {
            alert(`✓ ${sucessos} tempo(s) registrado(s) com sucesso!`);
            fecharRegistroTempo();
            
            // Limpa inputs
            document.querySelectorAll('.piloto-tempo-input').forEach(input => input.value = '');
            
            // Aguarda um pouco e recarrega dados
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            alert('❌ Nenhum tempo foi registrado. Verifique os dados e tente novamente.');
        }
        
    } catch (err) {
        console.error('[Registro] Erro ao salvar tempos:', err);
        alert(`Erro ao registrar tempos: ${err.message}`);
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('register-times-modal');
        if (modal && modal.classList.contains('modal--open')) {
            fecharRegistroTempo();
        }
    }
});