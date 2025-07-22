'use client';

import React from 'react';
import type { Node, Edge, AppPhase } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EdgeProps {
  edge: Edge;
  fromNode: Node;
  toNode: Node;
  isPath: boolean;
  isVisited: boolean;
  onClick: (edge: Edge) => void;
  phase: AppPhase;
}

export default function EdgeComponent({ edge, fromNode, toNode, isPath, isVisited, onClick, phase }: EdgeProps) {
  const { weight } = edge;
  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;
  const canInteract = phase === 'EDITING_EDGES';

  return (
    <g
      onClick={() => canInteract && onClick(edge)}
      className={cn(canInteract && 'cursor-pointer group')}
      style={{ pointerEvents: 'auto' }}
    >
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        className={cn(
          'transition-all duration-300 stroke-[10px] stroke-transparent',
          {
            'group-hover:stroke-primary/20': canInteract,
          }
        )}
      />
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        className={cn(
          'transition-all duration-300 pointer-events-none',
          {
            'stroke-slate-400 stroke-2': !isVisited && !isPath,
            'stroke-yellow-400 stroke-[3px]': isVisited && !isPath,
            'stroke-green-500 stroke-[4px]': isPath,
            'group-hover:stroke-primary group-hover:stroke-[4px]': canInteract,
          }
        )}
      />
      <text
        x={midX}
        y={midY - 8}
        textAnchor="middle"
        className={cn(
          'text-sm font-bold fill-foreground transition-all duration-300 pointer-events-none',
           isPath ? 'fill-black' : 'fill-foreground',
           canInteract && 'group-hover:fill-primary'
        )}
        style={{
          paintOrder: 'stroke',
          stroke: 'hsl(var(--card))',
          strokeWidth: '4px',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
        }}
      >
        {weight}
      </text>
    </g>
  );
}
