import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, X, CheckCircle2, XCircle, MinusCircle, Download, Save } from "lucide-react";
import { useState, useRef } from "react";
import type { InsertChecklistItem } from "../../../drizzle/schema";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function ChecklistDetail() {
  const params = useParams<{ id: string }>();
  const checklistId = parseInt(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editedItems, setEditedItems] = useState<Record<number, Partial<InsertChecklistItem>>>({});
  
  const { data: checklist, isLoading } = trpc.checklist.getById.useQuery({ id: checklistId });
  const { data: categories } = trpc.checklist.getCategories.useQuery();
  const { data: templates } = trpc.checklist.getTemplates.useQuery();
  
  const utils = trpc.useUtils();

  const createItemMutation = trpc.checklist.item.create.useMutation({
    onSuccess: () => {
      utils.checklist.getById.invalidate({ id: checklistId });
    },
  });

  const updateItemMutation = trpc.checklist.item.update.useMutation({
    onSuccess: () => {
      utils.checklist.getById.invalidate({ id: checklistId });
      toast.success("Item atualizado");
    },
  });

  const uploadPhotoMutation = trpc.checklist.photo.upload.useMutation({
    onSuccess: () => {
      utils.checklist.getById.invalidate({ id: checklistId });
      toast.success("Foto enviada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao enviar foto");
    },
  });

  const updateChecklistMutation = trpc.checklist.update.useMutation({
    onSuccess: () => {
      utils.checklist.getById.invalidate({ id: checklistId });
      toast.success("Checklist atualizado");
    },
  });

  const exportPDFMutation = trpc.checklist.exportPDF.useMutation({
    onSuccess: (data) => {
      toast.success("PDF gerado com sucesso");
      // Open PDF in new tab
      window.open(data.url, '_blank');
    },
    onError: () => {
      toast.error("Erro ao gerar PDF");
    },
  });

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

  const handleStatusChange = (templateId: number, status: "conforme" | "nao_conforme" | "nao_aplicavel") => {
    const existingItem = checklist.items?.find(item => item.templateId === templateId);
    
    if (existingItem) {
      updateItemMutation.mutate({
        id: existingItem.id,
        data: { status },
      });
    } else {
      createItemMutation.mutate({
        checklistId,
        templateId,
        status,
      });
    }
  };

  const handleObservationChange = (templateId: number, observations: string) => {
    setEditedItems(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        observations,
      }
    }));
  };

  const handleSaveItem = (templateId: number) => {
    const existingItem = checklist.items?.find(item => item.templateId === templateId);
    const edits = editedItems[templateId];
    
    if (!edits) return;
    
    if (existingItem) {
      updateItemMutation.mutate({
        id: existingItem.id,
        data: edits as any,
      });
    } else {
      createItemMutation.mutate({
        checklistId,
        templateId,
        ...(edits as any),
      });
    }
    
    setEditedItems(prev => {
      const newState = { ...prev };
      delete newState[templateId];
      return newState;
    });
  };

  const handlePhotoCapture = (itemId: number) => {
    setSelectedItemId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItemId) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        uploadPhotoMutation.mutate({
          checklistItemId: selectedItemId,
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao fazer upload da foto");
    }

    setSelectedItemId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleComplete = () => {
    updateChecklistMutation.mutate({
      id: checklistId,
      data: { status: "concluido" },
    });
  };

  const categorizedTemplates = categories?.map(cat => ({
    ...cat,
    templates: templates?.filter(t => t.categoryId === cat.id) || [],
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hidden file input for camera/photo capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
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
              <div className="text-center">
                <h1 className="text-lg font-bold text-slate-900">{checklist.constructionSite}</h1>
                <p className="text-xs text-slate-600">
                  {new Date(checklist.inspectionDate).toLocaleDateString('pt-BR')} - {checklist.inspectionTime}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {checklist.status === "concluido" ? (
                <Badge variant="default" className="bg-green-600">Concluído</Badge>
              ) : (
                <Button size="sm" onClick={handleComplete}>
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
            <CardTitle>Informações da Inspeção</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-slate-600">Inspetor</Label>
              <p className="font-medium">{checklist.inspectorName}</p>
              <p className="text-slate-600">{checklist.inspectorRole}</p>
            </div>
            <div>
              <Label className="text-slate-600">Condições</Label>
              <p className="font-medium">{checklist.weatherConditions || "Não informado"}</p>
              <p className="text-slate-600">{checklist.workersCount ? `${checklist.workersCount} trabalhadores` : ""}</p>
            </div>
            <div>
              <Label className="text-slate-600">Tipo</Label>
              <p className="font-medium">
                {checklist.inspectionType === "diaria" ? "Diária" : 
                 checklist.inspectionType === "semanal" ? "Semanal" : 
                 "Conforme Necessidade"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Items by Category */}
        <div className="space-y-6">
          {categorizedTemplates.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.templates.map((template) => {
                  const item = checklist.items?.find(i => i.templateId === template.id);
                  
                  return (
                    <div key={template.id} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="mb-3">
                        <p className="font-medium text-slate-900 mb-3">{template.question}</p>
                        
                        <RadioGroup
                          value={item?.status || ""}
                          onValueChange={(value) => handleStatusChange(template.id, value as any)}
                        >
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="conforme" id={`${template.id}-conforme`} />
                              <Label htmlFor={`${template.id}-conforme`} className="flex items-center gap-1 cursor-pointer">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Conforme
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao_conforme" id={`${template.id}-nao-conforme`} />
                              <Label htmlFor={`${template.id}-nao-conforme`} className="flex items-center gap-1 cursor-pointer">
                                <XCircle className="w-4 h-4 text-red-600" />
                                Não Conforme
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao_aplicavel" id={`${template.id}-na`} />
                              <Label htmlFor={`${template.id}-na`} className="flex items-center gap-1 cursor-pointer">
                                <MinusCircle className="w-4 h-4 text-slate-400" />
                                N/A
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {item && (
                        <>
                          <Textarea
                            placeholder="Observações..."
                            value={editedItems[template.id]?.observations ?? item.observations ?? ""}
                            onChange={(e) => handleObservationChange(template.id, e.target.value)}
                            className="mb-3"
                            rows={2}
                          />

                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePhotoCapture(item.id)}
                              disabled={uploadPhotoMutation.isPending}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              {uploadPhotoMutation.isPending ? "Enviando..." : "Adicionar Foto"}
                            </Button>
                            
                            {editedItems[template.id] && (
                              <Button
                                size="sm"
                                onClick={() => handleSaveItem(template.id)}
                                disabled={updateItemMutation.isPending}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Salvar
                              </Button>
                            )}
                          </div>

                          {item.photos && item.photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-3">
                              {item.photos.map((photo) => (
                                <div key={photo.id} className="relative">
                                  <img
                                    src={photo.photoUrl}
                                    alt="Evidência"
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Export Button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => exportPDFMutation.mutate({ id: checklistId })}
              disabled={exportPDFMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportPDFMutation.isPending ? "Gerando PDF..." : "Exportar PDF"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
