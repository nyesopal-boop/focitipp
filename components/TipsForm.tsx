"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader as Loader2, TrendingUp, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

interface TipsFormProps {
  onSubmit: (teamA: string, teamB: string) => void;
  isLoading: boolean;
}

export default function TipsForm({ onSubmit, isLoading }: TipsFormProps) {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamA.trim() || !teamB.trim()) {
      setError('Kérlek, add meg mindkét csapat nevét.');
      return;
    }

    if (!user) {
      setError('Bejelentkezés szükséges a tippek generálásához.');
      return;
    }

    setError('');
    onSubmit(teamA.trim(), teamB.trim());
  };

  return (
    <Card className="max-w-xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <CardTitle className="text-2xl font-bold text-gray-800">
            TippMix Akadémia
          </CardTitle>
        </div>
        <p className="text-gray-600">
          Adja meg a két csapat nevét, és kapjon megbízható forrásból érkező 70-90%-os pontosságú fogadási tippeket!
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <p className="text-blue-800 font-medium">Bejelentkezés szükséges</p>
            </div>
            <p className="text-blue-700 text-sm mb-3">
              A tippek generálásához be kell jelentkezned.
            </p>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/auth/login">Bejelentkezés</Link>
              </Button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamA" className="text-sm font-medium text-gray-700">
                Csapat A
              </Label>
              <Input
                id="teamA"
                type="text"
                placeholder="pl. Real Madrid"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="w-full"
                disabled={isLoading || !user}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamB" className="text-sm font-medium text-gray-700">
                Csapat B
              </Label>
              <Input
                id="teamB"
                type="text"
                placeholder="pl. Barcelona"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="w-full"
                disabled={isLoading || !user}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            disabled={isLoading || !user}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tippek generálása folyamatban...
              </>
            ) : (
              'Tippek generálása'
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}