import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Download, FileText } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function EPIChecklistDetail() {
  const params = useParams<{ id: string }>();
  const checklistId = parseInt(params.id);
  
  const { data: checklist, isLoading } = trpc.checklist.epi.getById.useQuery({ id: checklistId });
  const [newItem, setNewItem] = useState({
    epiName: "",
    ca: "",
    conservationState: "novo" as "novo" | "parcialmente_utilizado" | "desgaste" | "descarte",
    collaboratorName: "",
    observations: "",
  });

  const createItemMutation = trpc.checklist.epi.item.create.useMutation({
    onSuccess: () => {
      toast.success("EPI adicionado com sucesso");
      setNewItem({
        epiName: "",
        ca: "",
        conservationState: "novo",
        collaboratorName: "",
        observations: "",
      });
    },
    onError: () => {
      toast.error("Erro ao adicionar EPI");
    },
  });

  const updateChecklistMutation = trpc.checklist.epi.update.useMutation({
    onSuccess: () => {
      toast.success("Checklist concluído");
    },
    onError: () => {
      toast.error("Erro ao concluir checklist");
    },
  });

  const deleteItemMutation = trpc.checklist.epi.item.delete.useMutation({
    onSuccess: () => {
      toast.success("EPI removido");
    },
    onError: () => {
      toast.error("Erro ao remover EPI");
    },
  });

  const exportCSVMutation = trpc.checklist.epi.exportCSV.useMutation({
    onSuccess: (data) => {
      const element = document.createElement("a");
      const file = new Blob([data.csvContent], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = `EPI_${checklist?.constructionSite}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("CSV exportado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao exportar CSV");
    },
  });

  const exportPDFMutation = trpc.checklist.epi.exportPDF.useMutation({
    onSuccess: (data) => {
      const binaryString = window.atob(data.pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const file = new Blob([bytes], { type: "application/pdf" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = `EPI_${checklist?.constructionSite}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("PDF exportado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao exportar PDF");
    },
  });

  const utils = trpc.useUtils();

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

  if (!checklist) {
    return <div>Checklist não encontrado</div>;
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.epiName || !newItem.ca || !newItem.collaboratorName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createItemMutation.mutate(
      {
        epiChecklistId: checklistId,
        ...newItem,
      },
      {
        onSuccess: () => {
          utils.checklist.epi.getById.invalidate({ id: checklistId });
        },
      }
    );
  };

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Tem certeza que deseja remover este EPI?")) {
      deleteItemMutation.mutate(
        { id: itemId },
        {
          onSuccess: () => {
            utils.checklist.epi.getById.invalidate({ id: checklistId });
          },
        }
      );
    }
  };

  const handleComplete = () => {
    updateChecklistMutation.mutate(
      { id: checklistId, data: { status: "concluido" } },
      {
        onSuccess: () => {
          utils.checklist.epi.getById.invalidate({ id: checklistId });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none">
              <Link href="/epi">
                <Button variant="ghost" size="sm" className="w-fit">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <img src={APP_LOGO} alt="IPEX Logo" className="h-6 md:h-8" />
              <div className="text-center md:text-left min-w-0">
                <h1 className="text-sm md:text-lg font-bold text-slate-900 break-words line-clamp-2">{checklist.constructionSite}</h1>
                <p className="text-xs text-slate-600 whitespace-nowrap">
                  {new Date(checklist.inspectionDate).toLocaleDateString('pt-BR')} - {checklist.inspectionTime}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => exportCSVMutation.mutate({ id: checklistId })}
                disabled={exportCSVMutation.isPending}
                className="w-full md:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => exportPDFMutation.mutate({ id: checklistId })}
                disabled={exportPDFMutation.isPending}
                className="w-full md:w-auto"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              {checklist.status === "concluido" ? (
                <Badge variant="default" className="bg-green-600 w-full md:w-auto text-center md:text-left">Concluído</Badge>
              ) : (
                <Button size="sm" onClick={handleComplete} className="w-full md:w-auto">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Informações da Inspeção</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-slate-600">Inspetor</Label>
              <p className="font-medium">{checklist.inspectorName}</p>
              {checklist.inspectorRole && <p className="text-slate-600">{checklist.inspectorRole}</p>}
            </div>
            <div>
              <Label className="text-slate-600">Total de EPIs</Label>
              <p className="font-medium">{checklist.items?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Add New EPI */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Novo EPI</CardTitle>
            <CardDescription>Registre um novo equipamento de proteção individual</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="epiName">Nome do EPI *</Label>
                  <Input
                    id="epiName"
                    value={newItem.epiName}
                    onChange={(e) => setNewItem({ ...newItem, epiName: e.target.value })}
                    placeholder="Ex: Capacete de Segurança"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ca">CA (Certificado de Aprovação) *</Label>
                  <Input
                    id="ca"
                    value={newItem.ca}
                    onChange={(e) => setNewItem({ ...newItem, ca: e.target.value })}
                    placeholder="Ex: CA 1234567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="collaboratorName">Nome do Colaborador *</Label>
                  <Input
                    id="collaboratorName"
                    value={newItem.collaboratorName}
                    onChange={(e) => setNewItem({ ...newItem, collaboratorName: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="conservationState">Estado de Conservação</Label>
                  <Select value={newItem.conservationState} onValueChange={(value: any) => setNewItem({ ...newItem, conservationState: value })}>
                    <SelectTrigger id="conservationState">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="parcialmente_utilizado">Parcialmente Utilizado</SelectItem>
                      <SelectItem value="desgaste">Desgaste</SelectItem>
                      <SelectItem value="descarte">Descarte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={newItem.observations}
                    onChange={(e) => setNewItem({ ...newItem, observations: e.target.value })}
                    placeholder="Observações adicionais..."
                    rows={2}
                  />
                </div>
              </div>

              <Button type="submit" disabled={createItemMutation.isPending} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {createItemMutation.isPending ? "Adicionando..." : "Adicionar EPI"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* EPI Items List */}
        {checklist.items && checklist.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>EPIs Registrados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm md:text-base break-words">{item.epiName}</p>
                      <p className="text-xs md:text-sm text-slate-600">CA: {item.ca}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.conservationState === "novo" && "Novo"}
                      {item.conservationState === "parcialmente_utilizado" && "Parcialmente Utilizado"}
                      {item.conservationState === "desgaste" && "Desgaste"}
                      {item.conservationState === "descarte" && "Descarte"}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-600">Colaborador</p>
                      <p className="font-medium">{item.collaboratorName}</p>
                    </div>
                    {item.observations && (
                      <div>
                        <p className="text-slate-600">Observações</p>
                        <p className="text-sm">{item.observations}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deleteItemMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
