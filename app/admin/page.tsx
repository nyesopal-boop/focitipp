"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  CreditCard, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  subscription?: {
    status: string;
    currentPeriodEnd?: string;
  };
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

export default function AdminPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
    if (user?.role === 'ADMIN' && !isAccessGranted) {
      setShowAccessDialog(true);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN' && token && isAccessGranted) {
      fetchUsers();
      fetchSubscriptions();
    }
  }, [user, token, currentPage, searchTerm, isAccessGranted]);

  const handleAccessCodeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError('');

    try {
      const response = await fetch('/api/admin/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ accessCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAccessGranted(true);
        setShowAccessDialog(false);
        setAccessCode('');
      } else {
        setAccessError(data.error || 'Hibás belépési kód');
      }
    } catch (error) {
      setAccessError('Hiba történt a kód ellenőrzése során');
    }
  }, [accessCode, token]);
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const response = await fetch(
        `/api/admin/subscriptions?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      PAST_DUE: "destructive",
      CANCELED: "outline",
    };
    
    const labels: Record<string, string> = {
      ACTIVE: "Aktív",
      INACTIVE: "Inaktív",
      PAST_DUE: "Lejárt",
      CANCELED: "Lemondva",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
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

  // Access code dialog
  if (showAccessDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Adminpali Hozzáférés
            </CardTitle>
            <p className="text-gray-600">
              Adja meg a belépési kódot az admin felület eléréséhez
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700">
                  Belépési kód
                </Label>
                <div className="relative">
                  <Input
                    id="accessCode"
                    type={showAccessCode ? "text" : "password"}
                    placeholder="Adja meg a belépési kódot"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                  >
                    {showAccessCode ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Lock className="mr-2 h-4 w-4" />
                Belépés
              </Button>
            </form>

            {accessError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{accessError}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>Tipp:</strong> A belépési kód az ADMIN_ACCESS_CODE környezeti változóban található.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-4 relative">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Adminpali Felület</h1>
            <Badge variant="secondary" className="ml-2">
              Biztonságos hozzáférés
            </Badge>
          </div>
          <p className="text-gray-600">
            Üdvözöljük az Adminpali rendszerben! Felhasználók és előfizetések kezelése.
          </p>
        </div>

        {/* Keresés */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Keresés email vagy név alapján..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Felhasználók
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Előfizetések
            </TabsTrigger>
          </TabsList>

          {/* Felhasználók tab */}
          <TabsContent value="users">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Felhasználók ({users.length})</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  CSV Export
                </Button>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Név</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Szerepkör</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Előfizetés</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Regisztráció</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={user.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="py-3 px-2 text-gray-800">{user.email}</td>
                            <td className="py-3 px-2 text-gray-800">{user.name}</td>
                            <td className="py-3 px-2">
                              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                {user.role === 'ADMIN' ? 'Admin' : 'Felhasználó'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              {user.subscription ? getStatusBadge(user.subscription.status) : 'Nincs'}
                            </td>
                            <td className="py-3 px-2 text-gray-600">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Előfizetések tab */}
          <TabsContent value="subscriptions">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Előfizetések ({subscriptions.length})</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  CSV Export
                </Button>
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Felhasználó</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Státusz</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Lejárat</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Stripe ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((subscription, index) => (
                          <tr key={subscription.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="py-3 px-2 text-gray-800">{subscription.user.name}</td>
                            <td className="py-3 px-2 text-gray-800">{subscription.user.email}</td>
                            <td className="py-3 px-2">{getStatusBadge(subscription.status)}</td>
                            <td className="py-3 px-2 text-gray-600">
                              {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : '–'}
                            </td>
                            <td className="py-3 px-2 text-gray-600 font-mono text-xs">
                              {subscription.stripeSubscriptionId ? 
                                subscription.stripeSubscriptionId.slice(0, 20) + '...' : '–'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lapozás */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}