// Dados Técnicos
const PESO_BRUTO = { 'P13L': 28, 'P13C': 28, 'P45': 80, 'P20': 41, 'P8': 18, 'P5': 12 };
let camiao = null;

// Frota Configurada
const frota = {
    "QRF": { cols: 22, rows: 6, max_p13: 477, limite_kg: 6201 }
};

function buscarCaminhao() {
    const placa = document.getElementById('placa_busca').value.toUpperCase();
    
    if (frota[placa]) {
        camiao = frota[placa];
        document.getElementById('painel-frota').style.display = 'none';
        document.getElementById('area-calculo').style.display = 'block';
        document.getElementById('titulo-ativo').innerText = `Camião: ${placa} (${camiao.cols}x${camiao.rows})`;
        document.getElementById('qtd_p13_liq').value = camiao.max_p13;
        document.getElementById('msg-erro').style.display = 'none';
    } else {
        document.getElementById('msg-erro').style.display = 'block';
    }
}

function gerarMapa() {
    if (!camiao) return;

    // Captura Quantidades
    const q = {
        liq: parseInt(document.getElementById('qtd_p13_liq').value) || 0,
        cop: parseInt(document.getElementById('qtd_p13_cop').value) || 0,
        p45: parseInt(document.getElementById('qtd_p45').value) || 0,
        p20: parseInt(document.getElementById('qtd_p20').value) || 0,
        p8: parseInt(document.getElementById('qtd_p8').value) || 0,
        p5: parseInt(document.getElementById('qtd_p5').value) || 0
    };

    const prio = document.querySelector('input[name="prio"]:checked').value;
    const gridDiv = document.getElementById('grid_mapa');
    gridDiv.style.gridTemplateColumns = `repeat(${camiao.cols}, 1fr)`;
    gridDiv.innerHTML = '';

    // Lógica de Prioridade:
    // Se Liquigás sai primeiro, ela fica no fim (portas). 
    // Logo, preenchemos Copagaz primeiro na frente (cabine).
    let ordemP13 = (prio === 'L') ? ['P13C', 'P13L'] : ['P13L', 'P13C'];
    let stock = { 'P13L': q.liq, 'P13C': q.cop, 'P45': q.p45, 'P20': q.p20, 'P8': q.p8, 'P5': q.p5 };

    let total_peso = 0;

    // Gerar o Grid (Linha por linha, de trás para a frente do array para visualização)
    for (let r = camiao.rows - 1; r >= 0; r--) {
        for (let c = 0; c < camiao.cols; c++) {
            let pilha = [];
            let hMax = (c < 3 || c >= camiao.cols - 3) ? 3 : 4;

            // 1. Tentar P45 ou P20 primeiro (base)
            if (stock['P45'] > 0) { pilha.push('P45'); stock['P45']--; }
            else if (stock['P20'] > 0) { pilha.push('P20'); stock['P20']--; }
            
            // 2. Preencher com P13 conforme a prioridade
            while (pilha.length < hMax) {
                if (stock[ordemP13[0]] > 0) { pilha.push(ordemP13[0]); stock[ordemP13[0]]--; }
                else if (stock[ordemP13[1]] > 0) { pilha.push(ordemP13[1]); stock[ordemP13[1]]--; }
                else break;
            }

            // 3. Sobrou espaço? Colocar P8 ou P5 no topo
            while (pilha.length < hMax) {
                if (stock['P8'] > 0) { pilha.push('P8'); stock['P8']--; }
                else if (stock['P5'] > 0) { pilha.push('P5'); stock['P5']--; }
                else break;
            }

            // Criar Elemento Visual
            const cell = document.createElement('div');
            const topo = pilha[pilha.length - 1];
            cell.className = `celula ${topo ? 'bg-' + topo : 'bg-vazio'}`;
            cell.innerText = pilha.length || '';
            gridDiv.appendChild(cell);

            // Somar Peso
            pilha.forEach(item => total_peso += PESO_BRUTO[item]);
        }
    }

    // Exibir Resumo
    const resumo = document.getElementById('resumo');
    resumo.style.display = 'block';
    const pesoOk = total_peso <= (camiao.max_p13 * 28); // Exemplo de limite
    resumo.style.backgroundColor = pesoOk ? '#d4edda' : '#f8d7da';
    resumo.innerHTML = `Peso Total Estimado: ${total_peso} kg ${pesoOk ? '✅' : '⚠️ OVERLOAD'}`;
}
