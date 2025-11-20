import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Prepare data for charts
  const constructionSites = Object.keys(stats.checklistsByConstruction);
  const checklistData = constructionSites.map(site => ({
    name: site.substring(0, 15) + (site.length > 15 ? "..." : ""),
    fullName: site,
    total: stats.checklistsByConstruction[site].total,
    completed: stats.checklistsByConstruction[site].completed,
    nonConformities: stats.checklistsByConstruction[site].nonConformities,
  }));

  const epiStateData = Object.entries(
    Object.values(stats.epiByConstruction).reduce((acc: Record<string, number>, site) => {
      Object.entries(site.byState).forEach(([state, count]) => {
        acc[state] = (acc[state] || 0) + count;
      });
      return acc;
    }, {})
  ).map(([state, count]) => ({
    name: state === "novo" ? "Novo" :
          state === "parcialmente_utilizado" ? "Parcialmente Utilizado" :
          state === "desgaste" ? "Desgaste" : "Descarte",
    value: count,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
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
            <h1 className="text-lg font-bold text-slate-900">Dashboard de Segurança</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Checklists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalChecklists}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.completedChecklists} concluídos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checklists de EPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEPIChecklists}</div>
              <p className="text-xs text-muted-foreground mt-1">Registros de proteção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Não Conformidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.totalNonConformities}</div>
              <p className="text-xs text-muted-foreground mt-1">Identificadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalChecklists > 0 ? Math.round((stats.completedChecklists / stats.totalChecklists) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Checklists</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Checklists por Obra */}
          <Card>
            <CardHeader>
              <CardTitle>Checklists por Obra</CardTitle>
              <CardDescription>Total de inspeções realizadas por local</CardDescription>
            </CardHeader>
            <CardContent>
              {checklistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={checklistData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                    <Bar dataKey="completed" fill="#10b981" name="Concluídos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>

          {/* Estado de EPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Estado dos EPIs</CardTitle>
              <CardDescription>Distribuição por estado de conservação</CardDescription>
            </CardHeader>
            <CardContent>
              {epiStateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={epiStateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {epiStateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Não Conformidades por Obra */}
        <Card>
          <CardHeader>
            <CardTitle>Não Conformidades por Obra</CardTitle>
            <CardDescription>Quantidade de itens não conformes identificados</CardDescription>
          </CardHeader>
          <CardContent>
            {checklistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={checklistData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nonConformities" stroke="#ef4444" name="Não Conformidades" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
