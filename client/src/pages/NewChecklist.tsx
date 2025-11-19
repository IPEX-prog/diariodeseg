import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function NewChecklist() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    inspectionType: "diaria" as "diaria" | "semanal" | "conforme_necessidade",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionTime: new Date().toTimeString().slice(0, 5),
    inspectorName: user?.name || "",
    inspectorRole: "",
    constructionSite: "",
    weatherConditions: "",
    workersCount: "",
    generalObservations: "",
  });

  const createMutation = trpc.checklist.create.useMutation({
    onSuccess: (data) => {
      toast.success("Checklist criado com sucesso");
      setLocation(`/checklists/${data.checklistId}`);
    },
    onError: () => {
      toast.error("Erro ao criar checklist");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inspectorRole || !formData.constructionSite) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      inspectionType: formData.inspectionType,
      inspectionDate: new Date(formData.inspectionDate),
      inspectionTime: formData.inspectionTime,
      inspectorName: formData.inspectorName,
      inspectorRole: formData.inspectorRole,
      constructionSite: formData.constructionSite,
      weatherConditions: formData.weatherConditions || undefined,
      workersCount: formData.workersCount ? parseInt(formData.workersCount) : undefined,
      generalObservations: formData.generalObservations || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/checklists">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="IPEX Logo" className="h-8" />
              <h1 className="text-lg font-bold text-slate-900">Novo Checklist</h1>
            </div>
            
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Informações da Inspeção</CardTitle>
            <CardDescription>
              Preencha os dados da inspeção de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Inspeção */}
              <div className="space-y-2">
                <Label htmlFor="inspectionType">Tipo de Inspeção *</Label>
                <Select
                  value={formData.inspectionType}
                  onValueChange={(value) => setFormData({ ...formData, inspectionType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaria">Diária</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="conforme_necessidade">Conforme Necessidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Hora */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectionDate">Data da Inspeção *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectionTime">Hora *</Label>
                  <Input
                    id="inspectionTime"
                    type="time"
                    value={formData.inspectionTime}
                    onChange={(e) => setFormData({ ...formData, inspectionTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Responsável */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectorName">Nome do Inspetor *</Label>
                  <Input
                    id="inspectorName"
                    value={formData.inspectorName}
                    onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectorRole">Cargo/Função *</Label>
                  <Input
                    id="inspectorRole"
                    placeholder="Ex: Engenheiro de Segurança"
                    value={formData.inspectorRole}
                    onChange={(e) => setFormData({ ...formData, inspectorRole: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Obra */}
              <div className="space-y-2">
                <Label htmlFor="constructionSite">Local da Obra *</Label>
                <Input
                  id="constructionSite"
                  placeholder="Ex: Obra Residencial Jardim das Flores"
                  value={formData.constructionSite}
                  onChange={(e) => setFormData({ ...formData, constructionSite: e.target.value })}
                  required
                />
              </div>

              {/* Condições */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weatherConditions">Condições Climáticas</Label>
                  <Input
                    id="weatherConditions"
                    placeholder="Ex: Ensolarado, Nublado, Chuvoso"
                    value={formData.weatherConditions}
                    onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workersCount">Número de Trabalhadores</Label>
                  <Input
                    id="workersCount"
                    type="number"
                    min="0"
                    placeholder="Ex: 25"
                    value={formData.workersCount}
                    onChange={(e) => setFormData({ ...formData, workersCount: e.target.value })}
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="generalObservations">Observações Gerais</Label>
                <Textarea
                  id="generalObservations"
                  placeholder="Observações sobre a inspeção..."
                  rows={4}
                  value={formData.generalObservations}
                  onChange={(e) => setFormData({ ...formData, generalObservations: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link href="/checklists" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "Salvando..." : "Criar e Continuar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
