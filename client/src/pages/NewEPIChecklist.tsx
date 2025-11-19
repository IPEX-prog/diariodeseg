import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function NewEPIChecklist() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    constructionSite: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionTime: new Date().toTimeString().slice(0, 5),
    inspectorName: "",
    inspectorRole: "",
  });

  const createMutation = trpc.checklist.epi.create.useMutation({
    onSuccess: (data) => {
      toast.success("Checklist de EPI criado com sucesso");
      navigate(`/epi/${data.checklistId}`);
    },
    onError: () => {
      toast.error("Erro ao criar checklist de EPI");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.constructionSite || !formData.inspectorName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      ...formData,
      inspectionDate: new Date(formData.inspectionDate),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <img src={APP_LOGO} alt="IPEX Logo" className="h-8" />
            <h1 className="text-lg font-bold text-slate-900">Novo Checklist de EPI</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Inspeção de EPI</CardTitle>
            <CardDescription>Preencha os dados iniciais para criar um novo checklist de EPI</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="constructionSite">Local da Obra *</Label>
                  <Input
                    id="constructionSite"
                    value={formData.constructionSite}
                    onChange={(e) => setFormData({ ...formData, constructionSite: e.target.value })}
                    placeholder="Nome da obra"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inspectorName">Nome do Inspetor *</Label>
                  <Input
                    id="inspectorName"
                    value={formData.inspectorName}
                    onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inspectionDate">Data da Inspeção *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inspectionTime">Hora da Inspeção *</Label>
                  <Input
                    id="inspectionTime"
                    type="time"
                    value={formData.inspectionTime}
                    onChange={(e) => setFormData({ ...formData, inspectionTime: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="inspectorRole">Cargo/Função</Label>
                  <Input
                    id="inspectorRole"
                    value={formData.inspectorRole}
                    onChange={(e) => setFormData({ ...formData, inspectorRole: e.target.value })}
                    placeholder="Ex: Técnico de Segurança"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/">
                  <Button type="button" variant="outline" className="w-full md:w-auto">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Checklist"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
