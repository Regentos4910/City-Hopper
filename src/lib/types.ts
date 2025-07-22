export type NodeType = 'home' | 'city' | 'destination';

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export type AppPhase = 
  | 'PLACING_NODES'
  | 'ADDING_EDGES'
  | 'EDITING_EDGES'
  | 'CALCULATING'
  | 'SHOWING_PATH';
