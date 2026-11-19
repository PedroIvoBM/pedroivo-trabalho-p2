"""Trabalho P2 - Busca em Largura (BFS) e Busca em Profundidade (DFS).

Representação: grafo não ponderado por lista de adjacência.
Métrica: cada aresta examinada conta como uma operação.
"""

from collections import deque
from dataclasses import dataclass


@dataclass
class ResultadoBusca:
    """Agrupa o resultado e as métricas de uma busca no grafo."""

    caminho: list[int]
    ordem_visita: list[int]
    operacoes: int
    pico_fronteira: int

    @property
    def encontrado(self) -> bool:
        """Indica se a busca encontrou o destino."""
        return bool(self.caminho)


def reconstruir_caminho(
    anteriores: dict[int, int | None], destino: int
) -> list[int]:
    """Monta o caminho da origem ao destino usando os predecessores."""
    caminho: list[int] = []
    atual: int | None = destino
    while atual is not None:
        caminho.append(atual)
        atual = anteriores[atual]
    caminho.reverse()
    return caminho


def validar_entrada(
    grafo: dict[int, list[int]], origem: int, destino: int
) -> None:
    """Confere em tempo constante se origem e destino existem no grafo.

    As arestas são verificadas à medida que são examinadas na busca,
    sem percorrer o grafo inteiro antes do algoritmo começar.
    """
    if origem not in grafo or destino not in grafo:
        raise ValueError("Origem e destino precisam existir no grafo.")


def bfs(grafo: dict[int, list[int]], origem: int, destino: int) -> ResultadoBusca:
    """Busca em largura (fila FIFO), que encontra o menor caminho sem pesos.

    Complexidade: O(V + E) em tempo e O(V) em espaço no pior caso.
    """
    validar_entrada(grafo, origem, destino)
    fila = deque([origem])
    descobertos = {origem}
    anteriores: dict[int, int | None] = {origem: None}
    ordem_visita: list[int] = []
    operacoes = 0
    pico_fronteira = 1

    while fila:
        atual = fila.popleft()  # FIFO: o primeiro a entrar é o primeiro a sair.
        ordem_visita.append(atual)
        if atual == destino:
            return ResultadoBusca(
                reconstruir_caminho(anteriores, destino),
                ordem_visita,
                operacoes,
                pico_fronteira,
            )

        for vizinho in grafo[atual]:
            operacoes += 1  # Uma verificação de vizinho = uma operação.
            if vizinho not in grafo:
                raise ValueError(f"O nó {atual} aponta para um nó inexistente: {vizinho}.")
            if vizinho not in descobertos:
                descobertos.add(vizinho)
                anteriores[vizinho] = atual
                fila.append(vizinho)
                pico_fronteira = max(pico_fronteira, len(fila))

    return ResultadoBusca([], ordem_visita, operacoes, pico_fronteira)


def dfs(grafo: dict[int, list[int]], origem: int, destino: int) -> ResultadoBusca:
    """Busca em profundidade iterativa (pilha LIFO de nós e posições).

    Cada quadro (nó, índice do próximo vizinho) reproduz a chamada
    recursiva: um ramo é explorado até o fim antes de voltar ao pai.
    DFS não garante o menor caminho.
    Complexidade: O(V + E) em tempo e O(V) em espaço no pior caso.
    """
    validar_entrada(grafo, origem, destino)
    pilha: list[tuple[int, int]] = [(origem, 0)]
    descobertos = {origem}
    anteriores: dict[int, int | None] = {origem: None}
    ordem_visita: list[int] = []
    operacoes = 0
    pico_fronteira = 1

    while pilha:
        atual, indice_vizinho = pilha[-1]  # LIFO: examina sempre o topo.
        if indice_vizinho == 0:
            ordem_visita.append(atual)
            if atual == destino:
                return ResultadoBusca(
                    reconstruir_caminho(anteriores, destino),
                    ordem_visita,
                    operacoes,
                    pico_fronteira,
                )

        if indice_vizinho >= len(grafo[atual]):
            pilha.pop()  # Ramo encerrado: volta para o nó anterior.
            continue

        vizinho = grafo[atual][indice_vizinho]
        pilha[-1] = (atual, indice_vizinho + 1)
        operacoes += 1
        if vizinho not in grafo:
            raise ValueError(f"O nó {atual} aponta para um nó inexistente: {vizinho}.")
        if vizinho not in descobertos:
            descobertos.add(vizinho)
            anteriores[vizinho] = atual
            pilha.append((vizinho, 0))
            pico_fronteira = max(pico_fronteira, len(pilha))

    return ResultadoBusca([], ordem_visita, operacoes, pico_fronteira)


def mostrar_resultado(
    titulo: str, grafo: dict[int, list[int]], origem: int, destino: int
) -> None:
    """Executa e imprime as duas buscas para facilitar a comparação."""
    print(f"\n{titulo}")
    for nome, algoritmo in (("BFS", bfs), ("DFS", dfs)):
        resultado = algoritmo(grafo, origem, destino)
        caminho = " -> ".join(map(str, resultado.caminho)) if resultado.encontrado else "Não existe"
        print(f"{nome}: caminho = {caminho}")
        print(f"  Nós visitados: {len(resultado.ordem_visita)}")
        print(f"  Operações (arestas examinadas): {resultado.operacoes}")
        print(f"  Pico da fila/pilha: {resultado.pico_fronteira}")


if __name__ == "__main__":
    # CENÁRIO 1: caso comum com mais de um caminho (BFS acha o menor).
    grafo_comum = {
        0: [1, 3],
        1: [0, 2],
        2: [1, 5],
        3: [0, 5],
        5: [2, 3],
    }
    mostrar_resultado("Cenário 1 - caminhos alternativos", grafo_comum, 0, 5)
    assert len(bfs(grafo_comum, 0, 5).caminho) < len(dfs(grafo_comum, 0, 5).caminho)

    # CENÁRIO 2: caso de borda (origem e destino são o mesmo nó).
    grafo_borda = {0: [1], 1: [0]}
    mostrar_resultado("Cenário 2 - origem igual ao destino", grafo_borda, 0, 0)
    assert bfs(grafo_borda, 0, 0).caminho == [0]
    assert dfs(grafo_borda, 0, 0).caminho == [0]

    # CENÁRIO 3: pior caso ilustrativo, destino inacessível.
    # As duas buscas percorrem todos os nós alcançáveis antes de terminar.
    grafo_sem_saida = {
        0: [1],
        1: [0, 2],
        2: [1, 3],
        3: [2, 4],
        4: [3],
        5: [],
    }
    mostrar_resultado("Cenário 3 - sem caminho", grafo_sem_saida, 0, 5)
    assert not bfs(grafo_sem_saida, 0, 5).encontrado
    assert not dfs(grafo_sem_saida, 0, 5).encontrado

    print("\nOs três cenários passaram nas verificações.")
