import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';

export default function DashboardPage() {
  return (
    <section>
      <PageTitle
        title="Dashboard"
        description="Vista general del seguimiento interno de líderes."
      />
      <Card>
        <p className="text-sm text-slate-600">
          Aquí irá el resumen principal cuando se implemente la lógica de negocio.
        </p>
      </Card>
    </section>
  );
}
