// Configuração da Frota
const frota = { 
    "QRF": { cols: 22, rows: 6, max_p13: 477 } 
};

let camiaoAtivo = null;

// 1. Função para encontrar o camião
function buscarCaminhao() {
    const input = document.getElementById('placa_busca').value.toUpperCase();
    
    if (frota[input]) {
        camiaoAtivo = frota[input];
        document.getElementById('painel-frota').style.display = 'none';
        document.getElementById('area-calculo').style.display = 'block';
        // Preenche com o limite padrão de P13
        document.getElementById('qtd_p13_liq').value = camiaoAtivo.max_p13;
        document.getElementById('msg-erro').style.display = 'none';
    } else {
        document.getElementById('msg-erro').style.display = 'block';
    }
}

// 2. Função Principal de Geração do Mapa
function gerarMapa() {
    if (!camiaoAtivo) return;

    // Captura valores dos inputs
    const qLiq = parseInt(document.getElementById('qtd_p13_liq').value) || 0;
    const qCop = parseInt(document.getElementById('qtd_p13_cop').value) || 0;
    const qP45 = parseInt(document.getElementById('qtd_p45').value) || 0;
    const prio = document.querySelector('input[name="prio"]:checked').value;

    const gridMapa = document.getElementById('grid_mapa');
    gridMapa.style.gridTemplateColumns = `repeat(${camiaoAtivo.cols}, 1fr)`;
    gridMapa.innerHTML = '';

    // Definição de estoques para distribuir
    let estoque = { 'P13L': qLiq, 'P13C': qCop, 'P45': qP45 };
    
    // LOGICA DE PRIORIDADE:
    // Se Liquigás (L) descarrega primeiro, ela vai para as portas (final do caminhão).
    // Então, preenchemos a Copagaz primeiro na cabine.
    let ordemMarcas = (prio === 'L') ? ['P13C', 'P13L'] : ['P13L', 'P13C'];

    // Percorre o caminhão (da Cabine para as Portas)
    // r = fileiras (largura), c = colunas (comprimento)
    for (let r = camiaoAtivo.rows - 1; r >= 0; r--) {
        for (let c = 0; c < camiaoAtivo.cols; c++) {
            let div = document.createElement('div');
            let hMax = (c < 3 || c >= camiaoAtivo.cols - 3) ? 3 : 4; // Altura máxima por coluna
            let pilha = [];

            // Preenche a pilha de cada posição
            while(pilha.length < hMax) {
                if (estoque[ordemMarcas[0]] > 0) {
                    pilha.push(ordemMarcas[0]);
                    estoque[ordemMarcas[0]]--;
                } else if (estoque[ordemMarcas[1]] > 0) {
                    pilha.push(ordemMarcas[1]);
                    estoque[ordemMarcas[1]]--;
                } else if (estoque['P45'] > 0 && pilha.length === 0) {
                    pilha.push('P45');
                    estoque['P45']--;
                    break; // P45 ocupa o espaço todo da altura
                } else {
                    break; // Sem mais carga
                }
            }

            // Estiliza a célula do mapa baseada no que está no topo
            let topo = pilha[pilha.length - 1];
            if (topo) {
                div.className = `celula bg-${topo}`;
                div.innerText = pilha.length;
            } else {
                div.className = 'celula bg-vazio';
                div.innerText = '';
            }
            gridMapa.appendChild(div);
        }
    }

    // Resumo de sucesso
    const resumo = document.getElementById('resumo');
    resumo.style.display = 'block';
    resumo.style.background = '#d4edda';
    resumo.style.color = '#155724';
    resumo.innerText = "✅ Mapa gerado! Verifique a arrumação abaixo.";
}
