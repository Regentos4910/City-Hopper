'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { Node, Edge, AppPhase } from '@/lib/types';
import Palette from '@/components/palette';
import GraphCanvas from '@/components/graph-canvas';
import { Button } from '@/components/ui/button';
import { dijkstra } from '@/lib/dijkstra';
import { useToast } from '@/hooks/use-toast';
import { Undo2, Play } from 'lucide-react';

const INITIAL_HOME_NODE: Node = {
  id: 'home',
  name: 'Home',
  type: 'home',
  x: 150,
  y: 300,
};

export default function CityHopperApp() {
  const [nodes, setNodes] = useState<Node[]>([INITIAL_HOME_NODE]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [phase, setPhase] = useState<AppPhase>('PLACING_NODES');
  const [path, setPath] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const { toast } = useToast();

  const destinationNode = useMemo(() => nodes.find(n => n.type === 'destination'), [nodes]);
  const destinationNodeExists = !!destinationNode;

  const isDestinationConnected = useMemo(() => {
    if (!destinationNode) return false;
    return edges.some(edge => edge.from === destinationNode.id || edge.to === destinationNode.id);
  }, [edges, destinationNode]);

  const addNode = useCallback((node: Omit<Node, 'id' | 'name'>) => {
    setNodes(prev => {
      if (node.type === 'destination' && prev.some(n => n.type === 'destination')) {
        toast({ title: "Destination already exists", description: "You can only have one destination node.", variant: 'destructive' });
        return prev;
      }
      const newId = `${node.type}-${Date.now()}`;
      const name = node.type === 'destination' ? 'Destination' : `City ${prev.filter(n => n.type === 'city').length + 1}`;
      return [...prev, { ...node, id: newId, name }];
    });
  }, [toast]);

  const addEdge = useCallback((edge: Omit<Edge, 'id'>) => {
    const newEdge = { ...edge, id: `${edge.from}-${edge.to}` };
    setEdges(prev => [...prev, newEdge]);
  }, []);

  const updateEdgeWeight = useCallback((edgeId: string, newWeight: number) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId ? { ...edge, weight: newWeight } : edge
    ));
    toast({ title: 'Connection updated', description: `The weight has been changed to ${newWeight}.` });
  }, [toast]);
  
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    toast({ title: 'City deleted' });
  }, [toast]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    toast({ title: 'Connection deleted' });
  }, [toast]);


  const handleConfirmConnections = () => {
    if (!isDestinationConnected) {
       toast({ title: "Destination Not Connected", description: "The destination must be connected to at least one other city.", variant: 'destructive' });
       return;
    }
    calculateShortestPath();
  }

  const calculateShortestPath = () => {
    const homeNode = nodes.find(n => n.type === 'home');
    if (!homeNode || !destinationNode) return;

    setPhase('CALCULATING');
    const { path: dijkstraPath, visitedOrder } = dijkstra(nodes, edges, homeNode.id, destinationNode.id);

    if (dijkstraPath.length === 0) {
      toast({ title: "No Path Found", description: "A path from Home to Destination could not be found.", variant: 'destructive' });
      setPhase('ADDING_EDGES');
      return;
    }

    setPhase('SHOWING_PATH');
    setVisitedNodes(visitedOrder);
    setPath([]); // Clear previous path before starting new animation

    setAnimating(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < visitedOrder.length) {
        setPath(prev => [...prev, visitedOrder[step]]);
        step++;
      } else {
        clearInterval(interval);
        setPath(dijkstraPath); // Show final path
        setAnimating(false);
      }
    }, 700);
  };
  
  const reset = () => {
    setNodes([INITIAL_HOME_NODE]);
    setEdges([]);
    setPhase('PLACING_NODES');
    setPath([]);
    setVisitedNodes([]);
    setAnimating(false);
  };
  
  const getButtonText = () => {
    switch(phase) {
      case 'ADDING_EDGES': return <>Calculate Shortest Path <Play className="ml-2 h-4 w-4" /></>;
      default: return '';
    }
  };
  
  const enterEdgeMode = (mode: 'ADD' | 'EDIT') => {
    if (mode === 'ADD' || mode === 'EDIT') {
      if (!destinationNodeExists) {
        toast({ title: "No Destination", description: "Please add a destination node to proceed.", variant: 'destructive' });
        return;
      }
      if (nodes.length < 2) {
        toast({ title: "Not enough cities", description: "You need at least two cities to make a connection.", variant: 'destructive' });
        return;
      }
    }
    
    if(mode === 'EDIT' && edges.length === 0) {
      toast({ title: "No Connections", description: "There are no connections to edit.", variant: 'destructive' });
      return;
    }

    setPhase(mode === 'ADD' ? 'ADDING_EDGES' : 'EDITING_EDGES');
  }

  return (
    <div className="flex h-screen w-full font-body bg-background relative overflow-hidden">
      <div className="flex-1 flex flex-col p-4 relative">
        <header className="flex justify-between items-center pb-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold font-headline text-foreground">City Hopper</h1>
            <p className="text-muted-foreground">Build your map and find the shortest path!</p>
          </div>
        </header>
        <GraphCanvas 
          nodes={nodes}
          edges={edges}
          onNodeDrop={addNode}
          onEdgeAdd={addEdge}
          onEdgeUpdate={updateEdgeWeight}
          onNodeDelete={deleteNode}
          onEdgeDelete={deleteEdge}
          phase={phase}
          path={path}
          visitedNodes={visitedNodes}
          setNodes={setNodes}
          animating={animating}
        />
      </div>
      <Palette 
        destinationPlaced={destinationNodeExists}
        isDestinationConnected={isDestinationConnected}
        onConnectClick={() => enterEdgeMode('ADD')}
        onEditClick={() => enterEdgeMode('EDIT')}
        onConfirmConnections={handleConfirmConnections}
        phase={phase}
        setPhase={setPhase}
        onReset={reset}
        animating={animating}
      />
    </div>
  );
}
