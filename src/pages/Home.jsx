import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { calcularEdadGestacional, calcularFPP, evaluarRiesgoObstetrico } from '@/lib/gestogramaUtils';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Baby, Heart, Calendar, FlaskConical, BookHeart, Syringe, AlertTriangle, ChevronRight, Bell, Milk, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const RISK_CONFIG = {
  bajo: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Riesgo Bajo', dot: 'bg-emerald-500' },
  medio: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Riesgo Medio', dot: 'bg-amber-500' },
  alto: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Riesgo Alto', dot: 'bg-red-500' },
};

export default function Home() {
  const [perfil, setPerfil] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1),
      base44.entities.ConsultaPrenatal.list('-fecha', 5),
    ]).then(([perfiles, cons]) => {
      if (perfiles.length > 0) setPerfil(perfiles[0]);
      setConsultas(cons);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-24 h-24 gradient-rose rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
          <Baby className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">Bienvenida a MaternaApp</h1>
        <p className="text-muted-foreground text-center mb-8 text-lg">Tu compañera de control prenatal integral</p>
        <Link
          to="/perfil/nuevo"
          className="gradient-rose text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
        >
          Iniciar mi seguimiento
        </Link>
      </div>
    );
  }

  const eg = calcularEdadGestacional(perfil.fecha_ultima_menstruacion);
  const fpp = calcularFPP(perfil.fecha_ultima_menstruacion);
  const diasRestantes = fpp ? differenceInDays(fpp, new Date()) : null;
  const riesgo = evaluarRiesgoObstetrico(perfil, consultas);
  const riskCfg = RISK_CONFIG[riesgo.nivel];

  const quickLinks = [
    { to: '/consulta/nueva', icon: Heart, label: 'Automedición', color: 'bg-rose-100 text-rose-600' },
    { to: '/calendario', icon: Calendar, label: 'Mi Agenda', color: 'bg-violet-100 text-violet-600' },
    { to: '/estudios', icon: FlaskConical, label: 'Estudios', color: 'bg-sky-100 text-sky-600' },
    { to: '/vacunas', icon: Syringe, label: 'Vacunas', color: 'bg-teal-100 text-teal-600' },
    { to: '/diario', icon: BookHeart, label: 'Diario', color: 'bg-pink-100 text-pink-600' },
    { to: '/notas', icon: Bell, label: 'Notas', color: 'bg-amber-100 text-amber-600' },
    { to: '/lactancia', icon: Milk, label: 'Lactancia', color: 'bg-orange-100 text-orange-600' },
    { to: '/planificacion', icon: ShieldCheck, label: 'Planificación', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      {/* Header */}
      <div className="gradient-rose rounded-3xl p-5 text-white shadow-lg shadow-primary/25 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-white/80 text-sm font-medium mb-1">Hola, {perfil.nombre?.split(' ')[0]} 👋</p>
          <h1 className="text-2xl font-bold mb-3">Tu embarazo</h1>
          {eg && (
            <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-extrabold">{eg.semanas}</span>
              <span className="text-lg font-semibold mb-1">sem {eg.dias}d</span>
            </div>
          )}
          {fpp && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Fecha probable de parto: {format(fpp, 'dd MMMM yyyy', { locale: es })}</span>
            </div>
          )}
          {diasRestantes !== null && (
            <div className="mt-2 bg-white/20 rounded-xl px-3 py-1.5 inline-flex items-center gap-2">
              <Baby className="w-4 h-4" />
              <span className="text-sm font-semibold">{diasRestantes > 0 ? `${diasRestantes} días para el parto` : '¡Ya es tiempo!'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progreso gestacional */}
      {eg && (
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Progreso del embarazo</span>
            <span className="text-sm font-bold text-primary">{Math.round((eg.semanas / 40) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="gradient-rose h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((eg.semanas / 40) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">Semana 1</span>
            <span className="text-xs text-muted-foreground">Semana 40</span>
          </div>
        </div>
      )}

      {/* Nivel de riesgo */}
      <div className={cn('rounded-2xl p-4 border flex items-center justify-between', riskCfg.color)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-3 h-3 rounded-full', riskCfg.dot)} />
          <div>
            <p className="font-bold text-sm">{riskCfg.label}</p>
            {riesgo.factores.length > 0 && (
              <p className="text-xs opacity-80">{riesgo.factores.slice(0, 2).join(' · ')}</p>
            )}
          </div>
        </div>
        <Link to="/riesgo" className="flex items-center gap-1 text-xs font-semibold opacity-80">
          Ver <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-1.5 card-hover">
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm', color)}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-center text-foreground leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Alarmas */}
      <Link
        to="/alarmas"
        className="block w-full bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 card-hover"
      >
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-red-700">Signos de Alarma</p>
          <p className="text-xs text-red-500">Verifica tus síntomas aquí</p>
        </div>
        <ChevronRight className="w-5 h-5 text-red-400" />
      </Link>
    </div>
  );
}