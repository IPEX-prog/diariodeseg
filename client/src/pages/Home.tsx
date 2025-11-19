import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ClipboardCheck, FileText, Shield, Camera, Download } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="IPEX Logo" className="h-12" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">IPEX Construtora</h1>
              <p className="text-sm text-slate-600">Sistema de Checklist de Segurança</p>
            </div>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Olá, {user?.name}</span>
              <Link href="/checklists">
                <Button>Meus Checklists</Button>
              </Link>
            </div>
          ) : (
            <Button onClick={() => window.location.href = getLoginUrl()}>
              Entrar
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Conforme PBQP-H e NR-18
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Checklist de Segurança para Obras
          </h2>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Sistema completo para gerenciamento de checklists de segurança em obras de construção civil, 
            com captura de fotos, relatórios em PDF e total conformidade com as normas brasileiras.
          </p>

          {!isAuthenticated && (
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="text-lg px-8">
              Começar Agora
            </Button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <ClipboardCheck className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Checklists Completos</CardTitle>
              <CardDescription>
                Baseados em PBQP-H e NR-18 com todas as categorias de segurança
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Camera className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>Captura de Fotos</CardTitle>
              <CardDescription>
                Anexe fotos diretamente da câmera do dispositivo para evidências
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Frequências Flexíveis</CardTitle>
              <CardDescription>
                Inspeções diárias, semanais ou conforme necessidade da obra
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="w-10 h-10 text-orange-600 mb-2" />
              <CardTitle>Exportação PDF</CardTitle>
              <CardDescription>
                Gere relatórios profissionais em PDF com fotos e assinaturas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {isAuthenticated && (
        <section className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white">Pronto para começar?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Crie seu primeiro checklist de segurança agora
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/checklists/new">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Novo Checklist
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 IPEX Construtora. Sistema de Checklist de Segurança.</p>
          <p className="text-sm mt-2">Conforme normas PBQP-H e NR-18</p>
        </div>
      </footer>
    </div>
  );
}
