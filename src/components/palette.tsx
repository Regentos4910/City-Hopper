'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DraggableItem from '@/components/draggable-item';
import { Building2, Flag, Spline, CheckCircle, Pencil, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { AppPhase } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

interface PaletteProps {
  destinationPlaced: boolean;
  isDestinationConnected: boolean;
  onConnectClick: () => void;
  onEditClick: () => void;
  onConfirmConnections: () => void;
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  onReset: () => void;
  animating: boolean;
}

export default function Palette({ 
  destinationPlaced, 
  isDestinationConnected, 
  onConnectClick, 
  onEditClick, 
  onConfirmConnections, 
  phase, 
  setPhase,
  onReset,
  animating
}: PaletteProps) {
  const isPlacingNodes = phase === 'PLACING_NODES';
  const isAddingEdges = phase === 'ADDING_EDGES';
  const isEditingEdges = phase === 'EDITING_EDGES';
  
  const goBackToPlacing = () => {
    setPhase('PLACING_NODES');
  }
  
  const getTitle = () => {
    if (isPlacingNodes) return 'City Blocks';
    if (isAddingEdges) return 'Add Connections';
    if (isEditingEdges) return 'Edit Connections';
    return 'Connections';
  }
  
  const getDescription = () => {
    if (isPlacingNodes) return 'Drag items onto the map.';
    if (isAddingEdges) return 'Click two cities to connect them.';
    if (isEditingEdges) return 'Click a connection to change its weight.';
    return 'Manage your city connections.';
  }

  return (
    <div className={cn(
      "absolute top-0 right-0 h-full p-4 transition-transform duration-300 ease-in-out"
    )}>
      <Card className="w-64 h-auto shadow-lg bg-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="font-headline flex items-center">
                 {(isAddingEdges || isEditingEdges) && (
                    <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={goBackToPlacing}>
                      <ArrowLeft className="h-4 w-4"/>
                    </Button>
                  )}
                {getTitle()}
              </CardTitle>
              <CardDescription>
                {getDescription()}
              </CardDescription>
            </div>
             {(phase !== 'PLACING_NODES') && (
               <Button variant="ghost" size="icon" onClick={onReset} disabled={animating} className="h-8 w-8">
                 <Undo2 className="h-4 w-4" />
               </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isPlacingNodes && (
            <div className="flex flex-col gap-4">
              <DraggableItem type="city">
                <Building2 className="mr-2 h-5 w-5" />
                City Node
              </DraggableItem>
              <DraggableItem type="destination" disabled={destinationPlaced}>
                <Flag className="mr-2 h-5 w-5" />
                Destination
              </DraggableItem>
              <Button variant="outline" onClick={onConnectClick}>
                  <Spline className="mr-2 h-5 w-5" />
                  Connect Cities
              </Button>
               <Button variant="outline" onClick={onEditClick}>
                  <Pencil className="mr-2 h-5 w-5" />
                  Edit Connections
              </Button>
            </div>
          )}
           {(isAddingEdges || isEditingEdges) && (
            <div className="flex flex-col gap-4">
              <div className="text-sm text-muted-foreground p-4 text-center">
                {isAddingEdges 
                  ? "Select two cities on the map to create a connection. The destination must be connected."
                  : "Click on a connection line to edit its travel time (weight)."
                }
              </div>
               <Button onClick={onConfirmConnections} disabled={!isDestinationConnected}>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirm & Calculate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
