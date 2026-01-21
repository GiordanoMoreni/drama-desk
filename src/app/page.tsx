import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Theater, Users, Calendar, Star, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  // Check authentication - but don't redirect, show landing page for all users
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error checking authentication:', error);
    user = null;
  }

  // Always show landing page - authenticated users can still see it
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Theater className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Drama Desk</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/organizations/select">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link href="/admin">
                    <Button>Pannello Admin</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Accedi</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Inizia</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Gestione Teatrale Semplificata
              </Badge>
            </div>
            {user ? (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Bentornato su
                  <span className="text-blue-600 block">Drama Desk</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Continua a gestire le tue operazioni teatrali. Accedi alla dashboard per gestire
                  studenti, classi, spettacoli e produzioni.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/organizations/select">
                    <Button size="lg" className="text-lg px-8 py-3">
                      Vai alla Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                      Pannello Admin
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Gestisci il Tuo Teatro
                  <span className="text-blue-600 block">Come un Professionista</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Drama Desk è la soluzione SaaS multi-tenant completa per associazioni teatrali.
                  Gestisci studenti, classi, spettacoli e produzioni con facilità.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-8 py-3">
                      Inizia Prova Gratuita
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                      Accedi
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tutto Quello Che Ti Serve per la Gestione Teatrale
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dall'iscrizione degli studenti al sipario finale, gestisci ogni aspetto delle tue operazioni teatrali.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Gestione Studenti</CardTitle>
                <CardDescription>
                  Traccia informazioni degli studenti, contatti di emergenza e storico iscrizioni.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Pianificazione Classi</CardTitle>
                <CardDescription>
                  Crea e gestisci classi con pianificazione flessibile e gestione capacità.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Theater className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Gestione Produzioni</CardTitle>
                <CardDescription>
                  Pianifica spettacoli, assegna ruoli e traccia decisioni di casting con facilità.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto a Trasformare le Tue Operazioni Teatrali?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di professionisti del teatro che affidano a Drama Desk la gestione delle loro produzioni.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Inizia la Tua Prova Gratuita
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                Accedi al Tuo Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Theater className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Drama Desk</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Accedi
              </Link>
              <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                Registrati
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Drama Desk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
