'use client';

import React from 'react';
import type { Node as NodeType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Home, Building2, Flag, XCircle } from 'lucide-react';
import { Button } from './ui/button';

interface NodeProps {
  node: NodeType;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  isConnecting: boolean;
  isPath: boolean;
  isVisited: boolean;
  isDraggable: boolean;
  animating: boolean;
}

const ICONS: Record<NodeType['type'], React.ReactNode> = {
  home: <Home className="h-6 w-6" />,
  city: <Building2 className="h-6 w-6" />,
  destination: <Flag className="h-6 w-6" />,
};

export default function NodeComponent({ node, onClick, onDelete, onMouseDown, isConnecting, isPath, isVisited, isDraggable, animating }: NodeProps) {
  const { id, x, y, name, type } = node;
  
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(id);
  }

  return (
    <div
      id={id}
      className={cn(
        'absolute flex flex-col items-center justify-center p-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform -translate-x-1/2 -translate-y-1/2 select-none z-20 group',
        'w-32 h-20',
        type === 'home' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-gray-200 border-2 border-gray-400',
        isDraggable ? 'cursor-grab' : 'cursor-pointer',
        isConnecting && 'ring-4 ring-offset-2 ring-blue-500',
        isVisited && 'bg-yellow-300 border-yellow-500',
        isVisited && animating && 'animate-pulse',
        isPath && 'bg-green-400 border-green-600 scale-110',
      )}
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={() => onClick(id)}
      onMouseDown={(e) => onMouseDown(e, id)}
    >
      {type !== 'home' && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDeleteClick}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
      <div className="text-foreground">{ICONS[type]}</div>
      <span className="text-sm font-semibold text-foreground mt-1">{name}</span>
    </div>
  );
}
