'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Node } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface WeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number) => void;
  onDelete: () => void;
  node1?: Node;
  node2?: Node;
  initialWeight?: number;
}

export default function WeightInputModal({ isOpen, onClose, onSubmit, onDelete, node1, node2, initialWeight }: WeightInputModalProps) {
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialWeight !== undefined) {
        setWeight(String(initialWeight));
      }
    } else {
      // Reset state when modal closes
      setWeight('');
      setError('');
    }
  }, [isOpen, initialWeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericWeight = parseInt(weight, 10);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      setError('Please enter a valid positive number for the weight.');
      return;
    }
    setError('');
    onSubmit(numericWeight);
  };

  const title = initialWeight !== undefined ? "Edit Connection Weight" : "Set Connection Weight";
  const description = initialWeight !== undefined
    ? `Update the distance (weight) in miles between ${node1?.name} and ${node2?.name}.`
    : `Enter the distance (weight) in miles between ${node1?.name} and ${node2?.name}.`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight
              </Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 100"
                required
              />
            </div>
            {error && <p className="text-destructive text-sm col-span-4 text-center">{error}</p>}
          </div>
          <DialogFooter className="sm:justify-between">
            {initialWeight !== undefined ? (
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{initialWeight !== undefined ? 'Update Weight' : 'Set Weight'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
