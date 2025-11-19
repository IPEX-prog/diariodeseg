import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function EPIChecklistList() {
  const { data: checklists, isLoading } = trpc.checklist.epi.list.useQuery();
  const deleteMutation = trpc.checklist.epi.delete.useMutation({
    onSuccess: () => {
      toast.success("Checklist deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar checklist");
    },
  });

  const utils = trpc.useUtils();

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este checklist?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          utils.checklist.epi.list.invalidate();
        },
      });
    }
  };

  if (isLoading) {
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
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <img src={APP_LOGO} alt="IPEX Logo" className="h-8" />
              <h1 className="text-lg font-bold text-slate-900">Checklists de EPI</h1>
            </div>
            <Link href="/epi/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Checklist
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!checklists || checklists.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Nenhum checklist de EPI criado ainda</p>
              <Link href="/epi/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Checklist
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base md:text-lg break-words">{checklist.constructionSite}</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        {new Date(checklist.inspectionDate).toLocaleDateString('pt-BR')} às {checklist.inspectionTime}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={checklist.status === "concluido" ? "default" : "secondary"}
                      className={checklist.status === "concluido" ? "bg-green-600" : ""}
                    >
                      {checklist.status === "concluido" ? "Concluído" : "Em Andamento"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Inspetor</p>
                      <p className="font-medium">{checklist.inspectorName}</p>
                      {checklist.inspectorRole && <p className="text-xs text-muted-foreground">{checklist.inspectorRole}</p>}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Itens</p>
                      <p className="font-medium">0 EPIs registrados</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/epi/${checklist.id}`}>
                      <Button size="sm" variant="outline">
                        Abrir
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(checklist.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
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
