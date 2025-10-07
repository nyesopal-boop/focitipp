"use client";

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, TrendingUp, Loader as Loader2 } from 'lucide-react';

async function startCheckout(plan: "monthly" | "quarterly", token: string) {
  const res = await fetch("/api/stripe/checkout-session", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "Checkout hiba");
  window.location.href = data.url;
}

export default function PricingPage() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState<"monthly" | "quarterly" | "">("");
  const [error, setError] = useState('');

  const handleSubscribe = async (plan: "monthly" | "quarterly") => {
    if (!user) {
      setError('Bejelentkezés szükséges');
      return;
    }

    setLoading(plan);
    setError('');

    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout hiba");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Váratlan hiba történt');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen p-4 relative">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Válts PRO előfizetésre</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Korlátlan használat az előfizetés időtartama alatt
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Havi csomag */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-800">
                Havi
              </CardTitle>
              <div className="text-3xl font-bold text-gray-800">
                4.990 Ft
                <span className="text-sm font-normal text-gray-500">/hó</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Részletes tippek: gólok, végeredmény</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Szögletek és sárgalapok előrejelzése</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">200k szimuláció alapú esélyek</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Korlátlan használat 1 hónapig</span>
                </li>
              </ul>
              
              {isPro ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Aktív előfizetés
                </Button>
              ) : (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleSubscribe("monthly")}
                  disabled={loading !== "" || !user}
                >
                  {loading === "monthly" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Átirányítás a fizetéshez...
                    </>
                  ) : (
                    "Előfizetek – Havi"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Negyedéves csomag */}
          <Card className="shadow-lg border-2 border-green-500 bg-white/80 backdrop-blur rounded-2xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-600 text-white px-4 py-1">
                <Crown className="mr-1 h-3 w-3" />
                Legjobb ajánlat
              </Badge>
            </div>
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-800">
                Negyedéves
              </CardTitle>
              <div className="text-3xl font-bold text-gray-800">
                10.000 Ft
                <span className="text-sm font-normal text-gray-500">/3 hó</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Spórolj 4.970 Ft-ot!
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Részletes tippek: gólok, végeredmény</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Szögletek és sárgalapok előrejelzése</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">200k szimuláció alapú esélyek</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Korlátlan használat 3 hónapig</span>
                </li>
              </ul>
              
              {isPro ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Aktív előfizetés
                </Button>
              ) : (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleSubscribe("quarterly")}
                  disabled={loading !== "" || !user}
                >
                  {loading === "quarterly" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Átirányítás a fizetéshez...
                    </>
                  ) : (
                    "Előfizetek – Negyedéves"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-6 max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {!user && (
          <div className="mt-6 max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm text-center">
              Az előfizetéshez először be kell jelentkezned.
            </p>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-600 text-center max-w-2xl mx-auto">
          A fizetés a Stripe felületén történik. Az előfizetés lejártakor a PRO funkciók inaktívvá válnak. 
          Lejárat előtt értesítünk, és megújíthatod a díjcsomagodat.
        </div>
      </div>
    </div>
  );
}