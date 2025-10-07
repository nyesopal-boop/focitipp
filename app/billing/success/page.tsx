"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Crown, TrendingUp } from 'lucide-react';

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kis késleltetés a jobb UX érdekében
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Előfizetés feldolgozása...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Sikeres előfizetés!
          </CardTitle>
          <p className="text-gray-600">
            Gratulálunk! PRO előfizetésed aktív.
          </p>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">PRO funkciók aktiválva</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Részletes AI tippek</li>
              <li>✅ Pontos eredmény előrejelzés</li>
              <li>✅ Szögletek és sárgalapok</li>
              <li>✅ Korlátlan használat</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button className="w-full" asChild>
              <Link href="/">
                <TrendingUp className="mr-2 h-4 w-4" />
                Tippek generálása
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profile">
                Profil megtekintése
              </Link>
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-500">
              Session ID: {sessionId.slice(0, 20)}...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}