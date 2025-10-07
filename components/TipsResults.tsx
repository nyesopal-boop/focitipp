"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Crown, Lock } from 'lucide-react';
import { HeadToHeadMatch } from '@/lib/types';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TipsResultsProps {
  tips: string;
  matches: HeadToHeadMatch[];
  isLoadingTips: boolean;
  isLoadingMatches: boolean;
  tipsError: string;
  matchesError: string;
  isPro?: boolean;
}

export default function TipsResults({
  tips, 
  matches, 
  isLoadingTips, 
  isLoadingMatches, 
  tipsError, 
  matchesError,
  isPro = false
}: TipsResultsProps) {
  const { user } = useAuth();
  const isUserPro = isPro;


  const formatTips = (tipsText: string) => {
    const lines = tipsText.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        return (
          <li key={index} className="ml-4 mb-2 text-gray-700">
            {trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      
      if (trimmedLine.length > 0) {
        return (
          <p key={index} className="mb-2 text-gray-700 font-medium">
            {trimmedLine}
          </p>
        );
      }
      
      return null;
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tips Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl text-gray-800 flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Ajánlott fogadások
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingTips ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Tippek generálása folyamatban...</p>
            </div>
          ) : tipsError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{tipsError}</p>
            </div>
          ) : tips ? (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
              {!isUserPro && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">Korlátozott nézet</span>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    PRO előfizetéssel részletes szakértői tippeket kapsz: pontos eredmény, gólok száma, szögletek, sárgalapok és még sok más!
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/pricing">
                      <Crown className="mr-2 h-4 w-4" />
                      PRO előfizetés
                    </Link>
                  </Button>
                </div>
              )}
              
              <ul className="space-y-1">
                {formatTips(tips)}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Head-to-Head Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl text-gray-800 flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Egymás elleni (utolsó 5) meccs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingMatches ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Fej-fej elleni adatok betöltése...</p>
            </div>
          ) : matchesError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{matchesError}</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Dátum</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Liga</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Hazai</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Vendég</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Eredmény</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Szögletek (H–V)</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Sárgalapok (H–V)</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => (
                    <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="py-3 px-2 text-gray-600">{formatDate(match.date)}</td>
                      <td className="py-3 px-2 text-gray-600 max-w-32 truncate" title={match.league}>
                        {match.league}
                      </td>
                      <td className="py-3 px-2 text-gray-800 font-medium max-w-32 truncate" title={match.homeTeam}>
                        {match.homeTeam}
                      </td>
                      <td className="py-3 px-2 text-gray-800 font-medium max-w-32 truncate" title={match.awayTeam}>
                        {match.awayTeam}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-gray-800">
                        {match.score}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        {match.cornersHome !== null && match.cornersAway !== null 
                          ? `${match.cornersHome}–${match.cornersAway}` 
                          : '–'}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        {match.yellowHome !== null && match.yellowAway !== null 
                          ? `${match.yellowHome}–${match.yellowAway}` 
                          : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Nincsenek elérhető egymás elleni mérkőzések.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}