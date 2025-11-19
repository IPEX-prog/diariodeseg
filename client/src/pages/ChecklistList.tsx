import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, Calendar, Clock, MapPin, FileText, Trash2, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function ChecklistList() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: checklists, isLoading } = trpc.checklist.list.useQuery();
  
  const deleteMutation = trpc.checklist.delete.useMutation({
    onSuccess: () => {
      toast.success("Checklist excluído com sucesso");
      utils.checklist.list.invalidate();
    },
    onError: () => {
      toast.error("Erro ao excluir checklist");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este checklist?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "concluido") {
      return <Badge variant="default" className="bg-green-600">Concluído</Badge>;
    }
    return <Badge variant="secondary">Em Andamento</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      diaria: "Diária",
      semanal: "Semanal",
      conforme_necessidade: "Conforme Necessidade"
    };
    return <Badge variant="outline">{labels[type as keyof typeof labels] || type}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={APP_LOGO} alt="IPEX Logo" className="h-10" />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">IPEX Construtora</h1>
                  <p className="text-xs text-slate-600">Checklist de Segurança</p>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Olá, {user?.name}</span>
              <Link href="/checklists/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Checklist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Meus Checklists</h2>
          <p className="text-slate-600">Gerencie suas inspeções de segurança</p>
        </div>

        {!checklists || checklists.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <CardTitle>Nenhum checklist encontrado</CardTitle>
              <CardDescription>
                Comece criando seu primeiro checklist de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/checklists/new">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Checklist
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {getTypeBadge(checklist.inspectionType)}
                    </div>
                    {getStatusBadge(checklist.status)}
                  </div>
                  <CardTitle className="text-lg">{checklist.constructionSite}</CardTitle>
                  <CardDescription>
                    Inspetor: {checklist.inspectorName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(checklist.inspectionDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {checklist.inspectionTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {checklist.inspectorRole}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/checklists/${checklist.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(checklist.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
