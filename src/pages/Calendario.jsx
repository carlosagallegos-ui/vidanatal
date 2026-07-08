import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularEdadGestacional, ACCIONES_PRENATALES } from '@/lib/gestogramaUtils';
import { format, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CheckCircle2, Clock, FlaskConical, Syringe, Stethoscope, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIPO_CONFIG = {
  consulta: { icon: Stethoscope, color: 'bg-rose-100 text-rose-600', label: 'Consulta' },
  estudio: { icon: FlaskConical, color: 'bg-sky-100 text-sky-600', label: 'Estudio' },
  laboratorio: { icon: FlaskConical, color: 'bg-violet-100 text-violet-600', label: 'Laboratorio' },
  vacuna: { icon: Syringe, color: 'bg-teal-100 text-teal-600', label: 'Vacuna' },
  dental: { icon: Smile, color: 'bg-amber-100 text-amber-600', label: 'Dental' },
};

const VACUNAS_PROGRAMADAS = [
  { semana_inicio: 14, semana_fin: 40, titulo: 'Toxoide tetánico (Td)', descripcion: 'Protege contra tétanos y difteria. Se aplica en cada embarazo.' },
  { semana_inicio: 27, semana_fin: 36, titulo: 'Tdpa (tos ferina)', descripcion: 'Recomendada en cada embarazo entre semana 27-36 para proteger al bebé.' },
  { semana_inicio: 1, semana_fin: 40, titulo: 'Influenza estacional', descripcion: 'Recomendada en cualquier trimestre durante temporada de influenza.' },
];

const DETECCIONES = [
  { semana: 8, titulo: 'Prueba VIH', descripcion: 'Detección de VIH en primer contacto prenatal', tipo: 'laboratorio' },
  { semana: 8, titulo: 'Prueba de sífilis (RPR/VDRL)', descripcion: 'Tamizaje inicial y en tercer trimestre', tipo: 'laboratorio' },
  { semana: 8, titulo: 'Glucosa en ayuno', descripcion: 'Detección de diabetes pregestacional', tipo: 'laboratorio' },
  { semana: 12, titulo: 'Grupo y Rh', descripcion: 'Tipificación sanguínea obligatoria', tipo: 'laboratorio' },
  { semana: 16, titulo: 'Valoración dental', descripcion: 'Salud bucal — la enfermedad periodontal puede afectar el embarazo', tipo: 'dental' },
  { semana: 20, titulo: 'Trabajo social', descripcion: 'Evaluación de factores socioeconómicos y redes de apoyo', tipo: 'consulta' },
  { semana: 24, titulo: 'Curva de glucosa oral', descripcion: 'Detección de diabetes gestacional', tipo: 'laboratorio' },
];

export default function Calendario() {
  const [perfil, setPerfil] = useState(null);
  const [semanaFiltro, setSemanaFiltro] = useState('todas');
  const [completadas, setCompletadas] = useState([]);

  const cargarCompletadas = async (perfilId) => {
    const res = await base44.entities.ActividadCompletada.filter({ perfil_id: perfilId });
    setCompletadas(res);
  };

  useEffect(() => {
    base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1)
      .then(perfiles => {
        if (perfiles.length > 0) {
          setPerfil(perfiles[0]);
          cargarCompletadas(perfiles[0].id);
        }
      });
  }, []);

  const identificadorDe = (a) => `${a.origen}_${a.titulo}_${a.semana_inicio}`;

  const toggleCompletada = async (accion) => {
    const id = identificadorDe(accion);
    const existente = completadas.find(c => c.identificador === id);
    if (existente) {
      await base44.entities.ActividadCompletada.delete(existente.id);
    } else {
      await base44.entities.ActividadCompletada.create({
        perfil_id: perfil.id,
        identificador: id,
        titulo: accion.titulo,
        tipo: accion.tipo_display,
        fecha_completada: new Date().toISOString().split('T')[0],
      });
    }
    cargarCompletadas(perfil.id);
  };

  const eg = perfil ? calcularEdadGestacional(perfil.fecha_ultima_menstruacion) : null;
  const semanasActuales = eg?.semanas || 0;

  const todasAcciones = [
    ...ACCIONES_PRENATALES.map(a => ({ ...a, tipo_display: a.tipo, origen: 'consulta' })),
    ...VACUNAS_PROGRAMADAS.map(v => ({ ...v, tipo: 'vacuna', tipo_display: 'vacuna', origen: 'vacuna' })),
    ...DETECCIONES.map(d => ({ ...d, semana_inicio: d.semana, semana_fin: d.semana + 2, tipo_display: d.tipo, origen: 'deteccion' })),
  ].sort((a, b) => a.semana_inicio - b.semana_inicio);

  const filtradas = semanaFiltro === 'pendientes'
    ? todasAcciones.filter(a => !completadas.some(c => c.identificador === identificadorDe(a)) && a.semana_fin >= semanasActuales)
    : semanaFiltro === 'pasadas'
    ? todasAcciones.filter(a => completadas.some(c => c.identificador === identificadorDe(a)) || a.semana_fin < semanasActuales)
    : todasAcciones;

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mi Agenda Prenatal</h1>
          {eg && <p className="text-sm text-muted-foreground">Semana {eg.semanas} de gestación</p>}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[['todas', 'Todas'], ['pendientes', 'Pendientes'], ['pasadas', 'Completadas']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSemanaFiltro(val)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              semanaFiltro === val ? 'gradient-rose text-white shadow-md' : 'bg-muted text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Acciones */}
      <div className="space-y-2">
        {filtradas.map((accion, i) => {
          const config = TIPO_CONFIG[accion.tipo_display] || TIPO_CONFIG.consulta;
          const Icon = config.icon;
          const esActual = semanasActuales >= accion.semana_inicio && semanasActuales <= accion.semana_fin;
          const completada = completadas.some(c => c.identificador === identificadorDe(accion));

          return (
            <div key={i} className={cn(
              'bg-card rounded-2xl border p-4 transition-all duration-200',
              completada ? 'border-emerald-200 bg-emerald-50/50' :
              esActual ? 'border-primary/40 shadow-md shadow-primary/10' : 'border-border'
            )}>
              <div className="flex items-start gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', completada ? 'bg-emerald-100' : config.color)}>
                  {completada ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">
                      Sem {accion.semana_inicio}{accion.semana_inicio !== accion.semana_fin ? `-${accion.semana_fin}` : ''}
                    </span>
                    {esActual && !completada && (
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                        ¡Ahora!
                      </span>
                    )}
                    {completada && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">
                        ✓ Hecha
                      </span>
                    )}
                  </div>
                  <p className={cn('font-bold text-sm text-foreground', completada && 'line-through text-muted-foreground')}>{accion.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{accion.descripcion}</p>
                </div>
                <button
                  onClick={() => toggleCompletada(accion)}
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    completada
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}