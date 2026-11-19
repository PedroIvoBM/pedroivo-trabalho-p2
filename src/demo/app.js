/* Simulador de BFS e DFS em um grafo de grade não ponderado.
 * Cada célula livre é um vértice; cada vizinho ortogonal, uma aresta.
 * A métrica "operações" conta as arestas efetivamente examinadas.
 * Funciona sem servidor e sem bibliotecas externas.
 */
(() => {
  'use strict';

  const LINHAS = 7;
  const COLUNAS = 9;
  const TOTAL = LINHAS * COLUNAS;
  const INICIO_PADRAO = 3 * COLUNAS + 1;
  const FIM_PADRAO = 3 * COLUNAS + 7;

  const CENARIOS = {
    comparacao: {
      nome: 'Rotas diferentes',
      dica: 'Sem obstáculos: ideal para comparar o caminho mais curto.',
      paredes: [],
    },
    medio: {
      nome: 'Com obstáculos',
      dica: 'Paredes desviam os caminhos. Observe a ordem de exploração.',
      paredes: [[0, 4], [1, 4], [2, 4], [4, 4], [5, 4], [6, 4], [2, 6], [4, 6]],
    },
    pior: {
      nome: 'Sem caminho (pior caso)',
      dica: 'Uma parede separa a origem do destino. A busca examina toda a região alcançável.',
      paredes: Array.from({ length: LINHAS }, (_, linha) => [linha, 4]),
    },
    personalizado: {
      nome: 'Personalizado',
      dica: 'Clique nas células para desenhar obstáculos ou mover o início e o destino.',
      paredes: [],
    },
  };

  const $ = (id) => document.getElementById(id);
  const elementos = {
    grid: $('grid'),
    bfs: $('choose-bfs'),
    dfs: $('choose-dfs'),
    preset: $('preset'),
    help: $('scenario-help'),
    editMode: $('edit-mode'),
    speed: $('speed'),
    speedLabel: $('speed-label'),
    play: $('play'),
    pause: $('pause'),
    step: $('step'),
    reset: $('reset'),
    compare: $('compare'),
    assist: $('assist'),
    count: $('step-count'),
    progress: $('progress-bar'),
    action: $('action-label'),
    visited: $('visited-count'),
    operations: $('operations-count'),
    distance: $('distance-count'),
    peak: $('frontier-peak'),
    frontier: $('frontier'),
    frontierTitle: $('frontier-title'),
    frontierCaption: $('frontier-caption'),
    frontierNote: $('frontier-note'),
    events: $('event-list'),
    comparison: $('comparison'),
    closeComparison: $('close-comparison'),
    compareBfsDistance: $('compare-bfs-distance'),
    compareDfsDistance: $('compare-dfs-distance'),
    compareBfsVisits: $('compare-bfs-visits'),
    compareDfsVisits: $('compare-dfs-visits'),
    compareBfsOps: $('compare-bfs-ops'),
    compareDfsOps: $('compare-dfs-ops'),
    comparisonNote: $('comparison-note'),
  };

  const estado = {
    algoritmo: 'bfs',
    cenario: 'comparacao',
    inicio: INICIO_PADRAO,
    fim: FIM_PADRAO,
    paredes: new Set(),
    passos: [],
    indice: 0,
    timer: null,
  };

  const identificacao = (id) => `${Math.floor(id / COLUNAS) + 1},${(id % COLUNAS) + 1}`;
  const coordenada = (linha, coluna) => linha * COLUNAS + coluna;

  function parar() {
    if (estado.timer !== null) {
      clearInterval(estado.timer);
      estado.timer = null;
    }
  }

  function construirGrafo(paredes) {
    // Lista de adjacência. Ordem fixa: cima, direita, baixo, esquerda.
    const grafo = new Map();
    for (let id = 0; id < TOTAL; id += 1) {
      if (paredes.has(id)) continue;
      const linha = Math.floor(id / COLUNAS);
      const coluna = id % COLUNAS;
      const candidatos = [
        [linha - 1, coluna],
        [linha, coluna + 1],
        [linha + 1, coluna],
        [linha, coluna - 1],
      ];
      const vizinhos = candidatos
        .filter(([l, c]) => l >= 0 && l < LINHAS && c >= 0 && c < COLUNAS)
        .map(([l, c]) => coordenada(l, c))
        .filter((vizinho) => !paredes.has(vizinho));
      grafo.set(id, vizinhos);
    }
    return grafo;
  }

  function reconstruirCaminho(predecessores, destino) {
    const caminho = [];
    let atual = destino;
    while (atual !== null && atual !== undefined) {
      caminho.push(atual);
      atual = predecessores.get(atual);
    }
    return caminho.reverse();
  }

  function simular(algoritmo, inicio, fim, paredes) {
    const grafo = construirGrafo(paredes);
    const bfs = algoritmo === 'bfs';
    // BFS guarda IDs na fila; DFS guarda quadros com o próximo vizinho a analisar.
    const estrutura = bfs ? [inicio] : [{ no: inicio, proximo: 0 }];
    let cabecaDaFila = 0; // Evita o custo de deslocar o array inteiro com shift().
    const descobertos = new Set([inicio]);
    const visitados = new Set();
    const predecessores = new Map([[inicio, null]]);
    const passos = [];
    const historico = [];
    let operacoes = 0;
    let pico = 1;
    let caminho = [];
    let atual = null;
    let verificando = null;
    const nome = bfs ? 'fila' : 'pilha';

    const salvar = (mensagem, terminou = false) => {
      historico.push(mensagem);
      passos.push({
        mensagem,
        historico: historico.slice(-5),
        fronteira: bfs
          ? estrutura.slice(cabecaDaFila)
          : estrutura.map((entrada) => entrada.no),
        descobertos: new Set(descobertos),
        visitados: new Set(visitados),
        atual,
        verificando,
        operacoes,
        pico,
        caminho: [...caminho],
        terminou,
      });
    };

    salvar(`O início (${identificacao(inicio)}) entra na ${nome}.`);

    if (bfs) {
      while (cabecaDaFila < estrutura.length) {
        atual = estrutura[cabecaDaFila]; // FIFO: primeiro item ainda não processado.
        cabecaDaFila += 1;
        verificando = null;
        visitados.add(atual);
        salvar(`Visitamos (${identificacao(atual)}), removido da fila.`);

        if (atual === fim) {
          caminho = reconstruirCaminho(predecessores, fim);
          salvar(`Destino alcançado! Rota com ${caminho.length - 1} arestas.`, true);
          break;
        }

        for (const vizinho of grafo.get(atual)) {
          operacoes += 1;
          verificando = vizinho;
          if (descobertos.has(vizinho)) {
            salvar(`Analisamos (${identificacao(vizinho)}): já estava descoberto.`);
          } else {
            descobertos.add(vizinho);
            predecessores.set(vizinho, atual);
            estrutura.push(vizinho);
            pico = Math.max(pico, estrutura.length - cabecaDaFila);
            salvar(`Descobrimos (${identificacao(vizinho)}) e colocamos na fila.`);
          }
        }
      }
    } else {
      // DFS verdadeira: quadros na pilha preservam o ponto de retorno de cada ramo.
      while (estrutura.length > 0) {
        const topo = estrutura[estrutura.length - 1]; // LIFO
        atual = topo.no;
        verificando = null;
        if (!visitados.has(atual)) {
          visitados.add(atual);
          salvar(`Entramos em (${identificacao(atual)}), que está no topo da pilha.`);
          if (atual === fim) {
            caminho = reconstruirCaminho(predecessores, fim);
            salvar(`Destino alcançado! Rota com ${caminho.length - 1} arestas.`, true);
            break;
          }
        }

        const vizinhos = grafo.get(atual);
        if (topo.proximo >= vizinhos.length) {
          estrutura.pop();
          salvar(`Terminamos o ramo de (${identificacao(atual)}) e voltamos um nível.`);
          continue;
        }

        const vizinho = vizinhos[topo.proximo];
        topo.proximo += 1;
        operacoes += 1;
        verificando = vizinho;
        if (descobertos.has(vizinho)) {
          salvar(`Analisamos (${identificacao(vizinho)}): já estava descoberto.`);
        } else {
          descobertos.add(vizinho);
          predecessores.set(vizinho, atual);
          estrutura.push({ no: vizinho, proximo: 0 });
          pico = Math.max(pico, estrutura.length);
          salvar(`Descobrimos (${identificacao(vizinho)}) e descemos na pilha.`);
        }
      }
    }

    if (caminho.length === 0) {
      atual = null;
      verificando = null;
      salvar('Busca encerrada: não existe caminho até o destino.', true);
    }

    return { passos, caminho, operacoes, visitados: visitados.size, pico };
  }

  function gerarCelulas() {
    const fragmento = document.createDocumentFragment();
    for (let id = 0; id < TOTAL; id += 1) {
      const botao = document.createElement('button');
      botao.className = 'cell';
      botao.type = 'button';
      botao.dataset.id = String(id);
      botao.title = `Linha ${Math.floor(id / COLUNAS) + 1}, coluna ${(id % COLUNAS) + 1}`;
      botao.setAttribute('aria-label', botao.title);
      botao.addEventListener('click', () => editarCelula(id));
      fragmento.appendChild(botao);
    }
    elementos.grid.appendChild(fragmento);
  }

  function renderizar() {
    const passo = estado.passos[estado.indice];
    if (!passo) return;
    const rota = new Set(passo.caminho);
    const listaCelulas = elementos.grid.children;
    for (let id = 0; id < TOTAL; id += 1) {
      const celula = listaCelulas[id];
      celula.className = 'cell';
      celula.textContent = '';
      if (estado.paredes.has(id)) celula.classList.add('is-wall');
      if (passo.descobertos.has(id)) celula.classList.add('is-discovered');
      if (passo.visitados.has(id)) celula.classList.add('is-visited');
      if (id === passo.verificando) celula.classList.add('is-current-neighbor');
      if (rota.has(id)) celula.classList.add('is-path');
      if (id === passo.atual) celula.classList.add('is-active');
      if (id === estado.inicio) {
        celula.classList.add('is-start');
        if (id === estado.fim) celula.classList.add('is-end');
        celula.textContent = id === estado.fim ? 'I/F' : 'I';
      } else if (id === estado.fim) {
        celula.classList.add('is-end');
        celula.textContent = 'F';
      }
      // Um ponto destacado torna mais legível a etapa atual.
      if (id === passo.atual && id !== estado.inicio && id !== estado.fim) celula.textContent = '●';
    }

    elementos.count.textContent = `${estado.indice} / ${estado.passos.length - 1}`;
    elementos.progress.style.width = `${(100 * estado.indice) / Math.max(estado.passos.length - 1, 1)}%`;
    elementos.action.textContent = passo.mensagem;
    elementos.visited.textContent = passo.visitados.size;
    elementos.operations.textContent = passo.operacoes;
    elementos.distance.textContent = passo.caminho.length ? passo.caminho.length - 1 : '—';
    elementos.peak.textContent = passo.pico;

    const bfs = estado.algoritmo === 'bfs';
    elementos.frontierTitle.textContent = bfs ? 'Fila (FIFO)' : 'Pilha (LIFO)';
    elementos.frontierCaption.textContent = bfs ? 'Primeiro a entrar, primeiro a sair' : 'Último a entrar, primeiro a sair';
    elementos.frontierNote.textContent = bfs
      ? 'Na fila, o próximo a sair é o primeiro item.'
      : 'Na pilha, o próximo a sair é o último item.';
    elementos.frontier.replaceChildren();
    if (passo.fronteira.length === 0) {
      const vazio = document.createElement('span');
      vazio.className = 'frontier-empty';
      vazio.textContent = 'A estrutura está vazia.';
      elementos.frontier.appendChild(vazio);
    } else {
      passo.fronteira.forEach((id, i) => {
        const item = document.createElement('span');
        item.className = 'frontier-node';
        if (i === (bfs ? 0 : passo.fronteira.length - 1)) item.classList.add('next');
        item.textContent = identificacao(id);
        elementos.frontier.appendChild(item);
      });
    }

    elementos.events.replaceChildren();
    passo.historico.slice().reverse().forEach((mensagem, i) => {
      const item = document.createElement('li');
      const pequeno = document.createElement('small');
      pequeno.textContent = i === 0 ? 'PASSO ATUAL' : 'PASSO ANTERIOR';
      item.appendChild(pequeno);
      item.appendChild(document.createTextNode(mensagem));
      elementos.events.appendChild(item);
    });

    const chegou = estado.indice >= estado.passos.length - 1;
    elementos.step.disabled = chegou;
    elementos.play.disabled = chegou;
    elementos.pause.disabled = estado.timer === null;
    elementos.assist.textContent = chegou
      ? (passo.caminho.length ? 'Busca concluída. Use "Comparar" para ver os dois algoritmos.' : 'Busca concluída sem rota. Use outro cenário para experimentar.')
      : 'Você pode avançar um passo por vez ou executar automaticamente.';
  }

  function resetarExecucao() {
    parar();
    estado.passos = simular(estado.algoritmo, estado.inicio, estado.fim, estado.paredes).passos;
    estado.indice = 0;
    elementos.comparison.hidden = true;
    renderizar();
  }

  function aplicarCenario(nome) {
    parar();
    estado.cenario = nome;
    estado.inicio = INICIO_PADRAO;
    estado.fim = FIM_PADRAO;
    estado.paredes = new Set(CENARIOS[nome].paredes.map(([l, c]) => coordenada(l, c)));
    elementos.help.textContent = CENARIOS[nome].dica;
    elementos.preset.value = nome;
    resetarExecucao();
  }

  function editarCelula(id) {
    parar();
    const modo = elementos.editMode.value;
    if (modo === 'parede') {
      if (id === estado.inicio || id === estado.fim) return;
      if (estado.paredes.has(id)) estado.paredes.delete(id);
      else estado.paredes.add(id);
    } else if (modo === 'inicio') {
      estado.paredes.delete(id);
      estado.inicio = id;
    } else if (modo === 'fim') {
      estado.paredes.delete(id);
      estado.fim = id;
    }
    estado.cenario = 'personalizado';
    elementos.preset.value = 'personalizado';
    elementos.help.textContent = CENARIOS.personalizado.dica;
    resetarExecucao();
  }

  function proximo() {
    if (estado.indice >= estado.passos.length - 1) {
      parar();
      renderizar();
      return;
    }
    estado.indice += 1;
    if (estado.indice >= estado.passos.length - 1) parar();
    renderizar();
  }

  function executar() {
    if (estado.timer !== null || estado.indice >= estado.passos.length - 1) return;
    estado.timer = setInterval(proximo, Number(elementos.speed.value));
    renderizar();
  }

  function atualizarVelocidade() {
    const valor = Number(elementos.speed.value);
    elementos.speedLabel.textContent = valor <= 330 ? 'Rápida' : valor >= 800 ? 'Lenta' : 'Normal';
    if (estado.timer !== null) {
      parar();
      executar();
    }
  }

  function comparar() {
    parar();
    const bfs = simular('bfs', estado.inicio, estado.fim, estado.paredes);
    const dfs = simular('dfs', estado.inicio, estado.fim, estado.paredes);
    const tamanho = (resultado) => resultado.caminho.length ? String(resultado.caminho.length - 1) : 'Sem rota';
    elementos.compareBfsDistance.textContent = tamanho(bfs);
    elementos.compareDfsDistance.textContent = tamanho(dfs);
    elementos.compareBfsVisits.textContent = String(bfs.visitados);
    elementos.compareDfsVisits.textContent = String(dfs.visitados);
    elementos.compareBfsOps.textContent = String(bfs.operacoes);
    elementos.compareDfsOps.textContent = String(dfs.operacoes);
    if (bfs.caminho.length === 0) {
      elementos.comparisonNote.textContent = 'Nenhum método encontra o destino: não há conexão disponível.';
    } else if (dfs.caminho.length > bfs.caminho.length) {
      elementos.comparisonNote.textContent = `A BFS encontrou uma rota ${dfs.caminho.length - bfs.caminho.length} aresta(s) mais curta que a DFS.`;
    } else {
      elementos.comparisonNote.textContent = 'Neste cenário, os dois métodos encontraram rotas do mesmo tamanho. A BFS garante o menor caminho; a DFS não.';
    }
    elementos.comparison.hidden = false;
    renderizar();
  }

  elementos.bfs.addEventListener('click', () => selecionarAlgoritmo('bfs'));
  elementos.dfs.addEventListener('click', () => selecionarAlgoritmo('dfs'));
  function selecionarAlgoritmo(nome) {
    estado.algoritmo = nome;
    elementos.bfs.classList.toggle('selected', nome === 'bfs');
    elementos.dfs.classList.toggle('selected', nome === 'dfs');
    elementos.bfs.setAttribute('aria-pressed', String(nome === 'bfs'));
    elementos.dfs.setAttribute('aria-pressed', String(nome === 'dfs'));
    resetarExecucao();
  }

  elementos.preset.addEventListener('change', () => aplicarCenario(elementos.preset.value));
  elementos.speed.addEventListener('input', atualizarVelocidade);
  elementos.play.addEventListener('click', executar);
  elementos.pause.addEventListener('click', () => { parar(); renderizar(); });
  elementos.step.addEventListener('click', () => { parar(); proximo(); });
  elementos.reset.addEventListener('click', resetarExecucao);
  elementos.compare.addEventListener('click', comparar);
  elementos.closeComparison.addEventListener('click', () => { elementos.comparison.hidden = true; });

  gerarCelulas();
  aplicarCenario('comparacao');
  atualizarVelocidade();
})();
