import type { Node, Edge } from '@/lib/types';

export function dijkstra(nodes: Node[], edges: Edge[], startNodeId: string, endNodeId: string) {
  const distances: { [key: string]: number } = {};
  const prev: { [key: string]: string | null } = {};
  const pq = new Set<string>();
  const visitedOrder: string[] = [];

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    prev[node.id] = null;
    pq.add(node.id);
  });

  distances[startNodeId] = 0;

  while (pq.size > 0) {
    let u: string | null = null;
    let minDistance = Infinity;

    pq.forEach(nodeId => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        u = nodeId;
      }
    });

    if (u === null || u === endNodeId) break;

    pq.delete(u);
    visitedOrder.push(u);

    const neighbors = edges.filter(edge => edge.from === u || edge.to === u);

    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from;
      if (pq.has(v)) {
        const alt = distances[u] + edge.weight;
        if (alt < distances[v]) {
          distances[v] = alt;
          prev[v] = u;
        }
      }
    }
  }

  const path: string[] = [];
  let current: string | null = endNodeId;
  if (prev[current] || current === startNodeId) {
    while (current) {
      path.unshift(current);
      current = prev[current];
    }
  }

  visitedOrder.push(endNodeId);
  return { path: path.length > 1 || startNodeId === endNodeId ? path : [], visitedOrder };
}
