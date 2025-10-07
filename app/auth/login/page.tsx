"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ email, coupon })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login error");
      }
      
      setMsg("Sikeres belépés!");
      
      // Refresh the page to update auth state
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              Belépés
            </CardTitle>
          </div>
          <p className="text-gray-600">
            Adja meg email címét a belépéshez
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email cím
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coupon" className="text-sm font-medium text-gray-700">
                Kuponkód (opcionális)
              </Label>
              <Input
                id="coupon"
                type="text"
                placeholder="pl. PRO2025 vagy PRODEC25-XXXX-XXXX"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                A kuponkód PRO hozzáférést biztosít 2025 végéig.
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Beléptetés..." : "Belépés"}
            </Button>
            
            {msg && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                msg.includes("Sikeres") 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {msg}
              </div>
            )}
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Tipp:</strong> Nincs szükség regisztrációra vagy jelszóra. 
              Csak adja meg email címét és opcionálisan egy kuponkódot a PRO funkciókhöz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}