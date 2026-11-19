# Trabalho P2 — Busca em Largura (BFS) e Busca em Profundidade (DFS)

**Vídeo explicativo:** [https://drive.google.com/file/d/1Bk6ESLO3PtAvkmn44h2leCsaF3ShaJm2/view]

## Identificação

- **Aluno:** [Pedro Ivo Bárbara Medeiros de Oliveira]
- **RA:** [2840482521048]
- **Disciplina:** Estrutura de Dados
- **Tema:** D — Grafos: busca em largura (BFS) versus busca em profundidade (DFS)
- **Curso:** Análise e Desenvolvimento de Sistemas — Fatec Ribeirão Preto

## 1. Objetivo

Comparar duas maneiras de percorrer um grafo não ponderado e observar como a estrutura usada na busca muda a ordem de visita e a rota encontrada.

O projeto contém uma implementação em Python, três testes e um simulador interativo em HTML, CSS e JavaScript. A visualização apresenta o estado da fila ou pilha, os vértices visitados, cada aresta examinada e o caminho final.

## 2. Como executar

**Simulador visual:** abra o arquivo `src/demo/index.html` com dois cliques. Não é necessário instalar pacotes ou iniciar servidor.

1. Escolha **BFS** ou **DFS**.
2. Escolha um cenário: **Rotas diferentes**, **Com obstáculos** ou **Sem caminho (pior caso)**.
3. Use **Próximo passo**, **Executar**, **Pausar** e **Reiniciar**.
4. Clique em **Comparar BFS e DFS** para verificar o tamanho das rotas e as métricas.
5. Para modificar o cenário, selecione a ação de edição e clique nas células. A edição passa a ser um cenário personalizado.

**Python:** com Python 3.10 ou superior, abra um terminal na pasta `trabalho-p2-ed` e execute:

```bash
python src/algoritmo.py
```

No Windows, caso o comando anterior não funcione, tente:

```bash
py src/algoritmo.py
```

O programa imprime resultados e operações de três cenários com verificações automáticas (`assert`).

## 3. Conceitos e funcionamento

### Grafo e lista de adjacência

Um grafo possui **vértices** (pontos) e **arestas** (ligações). Aqui, cada célula livre do labirinto é um vértice, e cada ligação horizontal ou vertical é uma aresta de peso igual. Uma parede não pode ser atravessada.

No Python, o grafo é representado por um dicionário: cada chave é um vértice e o respectivo valor é a lista dos seus vizinhos. No JavaScript, essa mesma ideia é criada a partir do labirinto.

### BFS — Busca em Largura

A BFS utiliza uma **fila (FIFO)**: o primeiro elemento a entrar é o primeiro a sair. Assim, visita primeiro os vértices a uma aresta da origem, depois os vértices a duas arestas, e assim por diante. Por esse motivo, **garante o menor caminho em quantidade de arestas quando todas têm o mesmo peso**.

**Exemplos de uso:** menor número de conexões em uma rede social, caminhos em mapas sem pesos e exploração em níveis.

### DFS — Busca em Profundidade

A DFS utiliza uma **pilha (LIFO)** e explora um ramo até não haver um vizinho novo. Então, volta ao vértice anterior e tenta outra direção. Nesta implementação, a pilha armazena o vértice e o índice do próximo vizinho, reproduzindo o comportamento de uma DFS recursiva.

A DFS consegue encontrar um caminho quando ele existe, mas **não garante o menor caminho**.

**Exemplos de uso:** verificação de conectividade, identificação de componentes e exploração de possibilidades em um labirinto.

### Comparação observável

No cenário inicial (grade sem obstáculos, origem e destino na mesma linha):

| Algoritmo | Arestas na rota encontrada | Interpretação |
| --- | ---: | --- |
| BFS | 6 | Caminho direto e mínimo |
| DFS | 20 | Explora primeiro um ramo mais longo |

No cenário **Sem caminho**, uma parede separa as duas regiões. Ambos os algoritmos precisam explorar todos os vértices alcançáveis antes de concluir que o destino é inacessível.

A ordem dos vizinhos é fixa (cima, direita, baixo e esquerda). Outras ordens podem alterar a rota da DFS, sem alterar a garantia de menor caminho da BFS.

## 4. Análise de complexidade Big-O

Considere **V** como o número de vértices e **E** como o número de arestas.

| Algoritmo | Melhor caso (tempo) | Caso médio (tempo) | Pior caso (tempo) | Espaço auxiliar no pior caso |
| --- | --- | --- | --- | --- |
| BFS | O(1) | O(V + E) | O(V + E) | O(V) |
| DFS | O(1) | O(V + E) | O(V + E) | O(V) |

**Justificativas:**

- **Melhor caso:** a origem já é o destino, então a busca termina sem examinar arestas.
- **Caso médio:** é possível visitar parte significativa do grafo, examinando vértices e arestas.
- **Pior caso:** quando o destino está inacessível (ou só é encontrado no final), a busca examina todos os vértices alcançáveis e suas arestas. Com listas de adjacência, o tempo é O(V + E).
- **Espaço:** fila ou pilha, conjunto de descobertos e predecessores podem ocupar O(V). Na DFS iterativa, a pilha de quadros tem no máximo V vértices.

Em uma grade, cada vértice possui no máximo quatro vizinhos; por isso, o número de arestas cresce proporcionalmente ao número de células livres.

### Como as métricas são medidas

- **Vértices visitados:** quantos vértices foram efetivamente processados.
- **Operações:** cada verificação de um vizinho conta como uma operação, inclusive quando ele já havia sido descoberto.
- **Pico da fila/pilha:** maior quantidade de itens simultâneos na estrutura.
- **Tamanho da rota:** quantidade de arestas no caminho reconstruído a partir dos predecessores.

As métricas mostram o comportamento daquele cenário; Big-O representa como o custo cresce com a entrada.

## 5. Cenários de teste em Python

1. **Caso comum:** grafo com caminhos alternativos de tamanhos diferentes. A BFS encontra o menor; a DFS encontra uma rota maior.
2. **Caso de borda:** origem igual ao destino; ambas retornam o único vértice e zero verificações de vizinhos.
3. **Pior caso ilustrativo:** destino inacessível; ambas exploram a região alcançável e retornam uma rota vazia.

Os testes são executados automaticamente no bloco `if __name__ == "__main__":`.

## 6. Diário de engenharia com IA

**Ferramenta utilizada:** ChatGPT (GPT-6), como apoio para ler o enunciado, organizar o projeto, explicar algoritmos e revisar o código.

**Prompts registrados nesta conversa:**

1. `consegue visualisar o trabalho?`
2. `Vou precisar disso, não tenho nenhum conhecimento nessa matéria, e vou precisar fazer um trabalho profissonal e objetivo.`
3. `resuma absurdo pra mim; resuma para eu entender o que vamos fazer`

Os pedidos serviram para interpretar o enunciado, planejar o desenvolvimento com linguagem acessível e esclarecer a diferença entre BFS e DFS antes da revisão técnica.

**Limitação identificada e ajuste técnico:** uma versão inicial da DFS empilhava vários vizinhos simultaneamente, o que podia fazer os predecessores da rota divergirem da exploração em profundidade esperada. A abordagem foi revisada para manter uma pilha de quadros `(vértice, próximo vizinho)` e avançar por um ramo de cada vez. Isso preserva a visita em profundidade, facilita o acompanhamento visual e mantém O(V + E).

**Outro ajuste de complexidade:** a validação de todas as arestas antes do início da busca adicionava um custo O(V + E), mesmo quando a origem era igual ao destino. A validação inicial foi limitada aos dois vértices; ligações inválidas são verificadas durante a exploração. Assim, o melhor caso implementado também é O(1).

**Validações realizadas:** execução dos três cenários em Python, teste dos botões e das métricas no simulador em um navegador automatizado, comparação de rotas no cenário inicial (BFS: 6 arestas; DFS: 20), caso sem caminho e caso origem = destino. Antes da gravação, a execução deve ser conferida também no computador do aluno.