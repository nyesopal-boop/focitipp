"use client";

import { useState } from 'react';
import TipsForm from '@/components/TipsForm';
import TipsResults from '@/components/TipsResults';
import { useAuth } from '@/components/AuthProvider';
import { HeadToHeadMatch, TipsResponse, HeadToHeadResponse } from '@/lib/types';

export default function Home() {
  const [tips, setTips] = useState<string>('');
  const [matches, setMatches] = useState<HeadToHeadMatch[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [tipsError, setTipsError] = useState<string>('');
  const [matchesError, setMatchesError] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (teamA: string, teamB: string) => {
    setIsLoadingTips(true);
    setIsLoadingMatches(true);
    setTipsError('');
    setMatchesError('');
    setTips('');
    setMatches([]);
    setShowResults(true);

    // Generate tips
    const generateTips = async () => {
      try {
        console.log('Generating tips...');
        
        if (!user) {
          throw new Error('Bejelentkezés szükséges');
        }
        
        const response = await fetch('/api/generate-tips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ teamA, teamB }),
        });

        const data: TipsResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Hiba történt a tippek generálása közben');
        }

        setTips(data.text);
        setIsPro(data.isPro || false);
      } catch (err) {
        console.error('Tips error:', err);
        setTipsError(err instanceof Error ? err.message : 'Váratlan hiba történt');
      } finally {
        setIsLoadingTips(false);
      }
    };

    // Get head-to-head matches
    const getMatches = async () => {
      try {
        console.log('Getting H2H matches...');
        
        if (!user) {
          throw new Error('Bejelentkezés szükséges');
        }
        
        const response = await fetch(`/api/h2h?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}`, {
          headers: {
          },
          credentials: 'include',
        });
        const data: HeadToHeadResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Hiba történt az adatok lekérésekor');
        }

        setMatches(data.matches);
      } catch (err) {
        console.error('H2H error:', err);
        setMatchesError(err instanceof Error ? err.message : 'Váratlan hiba történt');
      } finally {
        setIsLoadingMatches(false);
      }
    };

    // Run both requests in parallel
    await Promise.all([generateTips(), getMatches()]);
  };

  return (
    <div className="min-h-screen p-4 relative">
      <div className="py-8">
        <TipsForm 
          onSubmit={handleSubmit} 
          isLoading={isLoadingTips || isLoadingMatches} 
        />
        
        {showResults && (
          <div className="mt-8">
            <TipsResults
              tips={tips}
              matches={matches}
              isLoadingTips={isLoadingTips}
              isLoadingMatches={isLoadingMatches}
              tipsError={tipsError}
              matchesError={matchesError}
              isPro={isPro}
            />
          </div>
        )}
      </div>
    </div>
  );
}