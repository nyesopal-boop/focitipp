"use client";

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Crown, Calendar, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, subscription, isPro, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const subscriptionEndDate = subscription?.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('hu-HU')
    : null;

  const isProUser = isPro;

  return (
    <div className="min-h-screen p-4 relative">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">
                Profil
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Felhasználói adatok */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email cím</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Név</p>
                  <p className="font-medium text-gray-800">{user.name}</p>
                </div>
              </div>

              {user.role === 'ADMIN' && (
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Szerepkör</p>
                    <Badge variant="secondary">Adminisztrátor</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Előfizetés státusz */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Előfizetés</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Státusz:</span>
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {isPro ? 'PRO Aktív' : 'Ingyenes'}
                  </Badge>
                </div>

                {isPro && subscriptionEndDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lejárat:</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800">{subscriptionEndDate}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  {isPro ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        ✅ Hozzáférésed van az összes PRO funkcióhoz!
                      </p>
                      <Button variant="outline" className="w-full">
                        Előfizetés kezelése
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        Frissíts PRO előfizetésre a teljes funkcionalitásért!
                      </p>
                      <Button className="w-full" asChild>
                        <Link href="/pricing">
                          <Crown className="mr-2 h-4 w-4" />
                          PRO előfizetés
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin link */}
            {user.role === 'ADMIN' && (
              <div className="border-t pt-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin">
                    Admin felület
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}