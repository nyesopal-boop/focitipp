"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ticket, Plus, Calendar, Users } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  startsAt: string;
  expiresAt: string;
  maxRedemptions: number;
  redeemedCount: number;
  redeemedByUserId?: string | null;
  redeemedAt?: string | null;
  createdAt: string;
};

export default function AdminCoupons() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [startsAt, setStartsAt] = useState<string>(new Date().toISOString().slice(0,16));
  const [expiresAt, setExpiresAt] = useState<string>(new Date(Date.now()+30*86400000).toISOString().slice(0,16));
  const [code, setCode] = useState<string>("");
  const [maxRedemptions, setMaxRedemptions] = useState<number>(1);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  async function load() {
    if (!token) return;
    
    try {
      setLoadingData(true);
      const r = await fetch("/api/admin/coupons", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const j = await r.json();
      setCoupons(j.coupons || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      load();
    }
  }, [user, token]);

  async function createCoupon() {
    if (!token) return;
    
    setLoadingCreate(true);
    try {
      const body = {
        code: code.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        maxRedemptions: Number(maxRedemptions) || 1
      };
      
      const r = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      
      const j = await r.json();
      if (!r.ok) { 
        alert(j.error || "Hiba"); 
      } else { 
        setCode(""); 
        await load(); 
      }
    } finally {
      setLoadingCreate(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const starts = new Date(coupon.startsAt);
    const expires = new Date(coupon.expiresAt);
    
    if (coupon.redeemedCount >= coupon.maxRedemptions) {
      return <Badge variant="secondary">Felhasználva</Badge>;
    }
    if (now < starts) {
      return <Badge variant="outline">Várakozik</Badge>;
    }
    if (now > expires) {
      return <Badge variant="destructive">Lejárt</Badge>;
    }
    return <Badge variant="default">Aktív</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen p-4 relative">
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Kuponok kezelése</h1>
          </div>
          <p className="text-gray-600">
            PRO előfizetés kuponok létrehozása és kezelése
          </p>
        </div>

        {/* Kupon létrehozás */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Új kupon létrehozása
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Kuponkód (opcionális)
                </Label>
                <Input
                  id="code"
                  placeholder="pl. PRO-2025-Q4-VIP"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="startsAt" className="text-sm font-medium text-gray-700">
                  Kezdés
                </Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiresAt" className="text-sm font-medium text-gray-700">
                  Lejárat
                </Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxRedemptions" className="text-sm font-medium text-gray-700">
                  Max. felhasználás
                </Label>
                <Input
                  id="maxRedemptions"
                  type="number"
                  min={1}
                  value={maxRedemptions}
                  onChange={e => setMaxRedemptions(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-4">
                <Button 
                  onClick={createCoupon} 
                  disabled={loadingCreate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loadingCreate ? "Létrehozás..." : "Kupon létrehozása"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kuponok listája */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kuponok ({coupons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Kód</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Státusz</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Kezdés</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Lejárat</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Felhasználás</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Felhasználta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, index) => (
                      <tr key={coupon.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-2 font-mono text-gray-800">{coupon.code}</td>
                        <td className="py-3 px-2">{getStatusBadge(coupon)}</td>
                        <td className="py-3 px-2 text-gray-600">{formatDate(coupon.startsAt)}</td>
                        <td className="py-3 px-2 text-gray-600">{formatDate(coupon.expiresAt)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-gray-800">{coupon.redeemedCount}</span>
                          <span className="text-gray-500">/{coupon.maxRedemptions}</span>
                        </td>
                        <td className="py-3 px-2 text-gray-600 font-mono text-xs">
                          {coupon.redeemedByUserId ? 
                            coupon.redeemedByUserId.slice(0, 8) + '...' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}