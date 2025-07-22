'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { NodeType } from '@/lib/types';

interface DraggableItemProps {
  type: Exclude<NodeType, 'home'>;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function DraggableItem({ type, children, disabled = false }: DraggableItemProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('nodeType', type);
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      className={cn(
        'flex items-center justify-center p-4 rounded-lg border-2 border-dashed bg-background hover:bg-secondary hover:border-primary transition-colors',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab',
      )}
    >
      {children}
    </div>
  );
}
