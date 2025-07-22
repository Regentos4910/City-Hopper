'use client';

import React, { useState, useCallback, useRef } from 'react';
import type { Node, Edge, NodeType, AppPhase } from '@/lib/types';
import NodeComponent from '@/components/node';
import EdgeComponent from '@/components/edge';
import WeightInputModal from '@/components/weight-input-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeDrop: (node: Omit<Node, 'id' | 'name'>) => void;
  onEdgeAdd: (edge: Omit<Edge, 'id'>) => void;
  onEdgeUpdate: (edgeId: string, newWeight: number) => void;
  onNodeDelete: (nodeId: string) => void;
  onEdgeDelete: (edgeId: string) => void;
  phase: AppPhase;
  path: string[];
  visitedNodes: string[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  animating: boolean;
}

export default function GraphCanvas({
  nodes,
  edges,
  onNodeDrop,
  onEdgeAdd,
  onEdgeUpdate,
  onNodeDelete,
  onEdgeDelete,
  phase,
  path,
  visitedNodes,
  setNodes,
  animating,
}: GraphCanvasProps) {
  const [connectingNodes, setConnectingNodes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingEdge, setPendingEdge] = useState<{ from: string; to: string } | null>(null);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const nodeType = e.dataTransfer.getData('nodeType') as NodeType;
    if (!nodeType) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onNodeDrop({ type: nodeType, x, y });
  };
  
  const handleNodeClick = (nodeId: string) => {
    if (phase !== 'ADDING_EDGES') return;

    if (connectingNodes.length === 0) {
      setConnectingNodes([nodeId]);
      toast({ title: 'Select a second city to connect.' });
    } else {
      const [fromNodeId] = connectingNodes;
      if (fromNodeId === nodeId) {
        setConnectingNodes([]); // Deselect if same node clicked again
        return;
      }

      const edgeExists = edges.some(
        edge => (edge.from === fromNodeId && edge.to === nodeId) || (edge.from === nodeId && edge.to === fromNodeId)
      );
      if (edgeExists) {
        toast({ title: 'Connection already exists.', variant: 'destructive' });
        setConnectingNodes([]);
        return;
      }

      setPendingEdge({ from: fromNodeId, to: nodeId });
      setIsModalOpen(true);
      setConnectingNodes([]);
    }
  };

  const handleEdgeClick = (edge: Edge) => {
    if (phase !== 'EDITING_EDGES') return;
    setEditingEdge(edge);
    setIsModalOpen(true);
  };
  
  const handleWeightSubmit = (weight: number) => {
    if (editingEdge) {
      onEdgeUpdate(editingEdge.id, weight);
    } else if (pendingEdge) {
      onEdgeAdd({ ...pendingEdge, weight });
    }
    closeModal();
  };

  const handleEdgeDelete = () => {
    if (editingEdge) {
      onEdgeDelete(editingEdge.id);
    }
    closeModal();
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setPendingEdge(null);
    setEditingEdge(null);
  }

  const handleNodeMouseDown = (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    if(phase === 'PLACING_NODES' || phase === 'ADDING_EDGES' || phase === 'EDITING_EDGES') {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.type !== 'home' && canvasRef.current) {
            setDraggingNode(nodeId);
            const rect = canvasRef.current.getBoundingClientRect();
            setDragOffset({ x: e.clientX - node.x - rect.left, y: e.clientY - node.y - rect.top });
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingNode && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - dragOffset.x - rect.left;
        const y = e.clientY - dragOffset.y - rect.top;
        
        const constrainedX = Math.max(0, Math.min(x, rect.width));
        const constrainedY = Math.max(0, Math.min(y, rect.height));

        setNodes(currentNodes =>
            currentNodes.map(n =>
                n.id === draggingNode ? { ...n, x: constrainedX, y: constrainedY } : n
            )
        );
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const getNodeById = useCallback((id: string) => nodes.find(n => n.id === id), [nodes]);

  const modalNode1 = editingEdge ? getNodeById(editingEdge.from) : (pendingEdge ? getNodeById(pendingEdge.from) : undefined);
  const modalNode2 = editingEdge ? getNodeById(editingEdge.to) : (pendingEdge ? getNodeById(pendingEdge.to) : undefined);
  const modalInitialWeight = editingEdge ? editingEdge.weight : undefined;

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn("w-full h-full bg-card rounded-lg border-2 border-dashed relative overflow-hidden shadow-inner", {
          "cursor-crosshair": (phase === 'ADDING_EDGES' || phase === 'EDITING_EDGES') && !draggingNode,
          "cursor-grabbing": !!draggingNode,
          "cursor-default": !draggingNode && phase !== 'ADDING_EDGES' && phase !== 'EDITING_EDGES'
      })}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <g>
          {edges.map(edge => {
            const fromNode = getNodeById(edge.from);
            const toNode = getNodeById(edge.to);
            if (!fromNode || !toNode) return null;

            const isPathEdge = 
              path.includes(edge.from) && path.includes(edge.to) &&
              (path.indexOf(edge.from) + 1 === path.indexOf(edge.to) || path.indexOf(edge.to) + 1 === path.indexOf(edge.from));

            const isVisitedEdge =
              visitedNodes.includes(edge.from) && visitedNodes.includes(edge.to);

            return (
              <EdgeComponent
                key={edge.id}
                edge={edge}
                fromNode={fromNode}
                toNode={toNode}
                isPath={isPathEdge}
                isVisited={isVisitedEdge}
                onClick={handleEdgeClick}
                phase={phase}
              />
            );
          })}
        </g>
      </svg>
      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          onClick={handleNodeClick}
          onDelete={onNodeDelete}
          onMouseDown={handleNodeMouseDown}
          isConnecting={connectingNodes.includes(node.id)}
          isPath={path.includes(node.id)}
          isVisited={visitedNodes.includes(node.id) && !path.includes(node.id) && !animating}
          isDraggable={(phase === 'PLACING_NODES' || phase === 'ADDING_EDGES' || phase === 'EDITING_EDGES') && node.type !== 'home'}
          animating={animating && (isVisitedEdge(node.id, visitedNodes) || isPathEdge(node.id, path))}
        />
      ))}
      {(pendingEdge || editingEdge) && (
         <WeightInputModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleWeightSubmit}
          onDelete={handleEdgeDelete}
          node1={modalNode1}
          node2={modalNode2}
          initialWeight={modalInitialWeight}
        />
      )}
    </div>
  );
}

function isVisitedEdge(nodeId: string, visitedNodes: string[]): boolean {
    return visitedNodes.includes(nodeId);
}

function isPathEdge(nodeId: string, path: string[]): boolean {
    return path.includes(nodeId);
}
