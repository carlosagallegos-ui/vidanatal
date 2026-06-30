import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularEdadGestacional } from '@/lib/gestogramaUtils';
import { BookHeart, Plus, Smile, Meh, Frown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const SINTOMAS_LISTA = [
  'Náuseas', 'Vómitos', 'Dolor de cabeza', 'Visión borrosa', 'Zumbidos en los oídos',
  'Dolor abdominal', 'Sangrado vaginal', 'Flujo inusual', 'Ardor al orinar',
  'Fiebre', 'Edema en cara/manos', 'Mareos', 'Desmayos', 'Dificultad para respirar',
  'Contracciones', 'Disminución de movimientos fetales', 'Dolor en el pecho', 'Dolor de espalda intenso',
];

const SIGNOS_ALARMA = [
  'Sangrado vaginal', 'Visión borrosa', 'Dolor de cabeza intenso', 'Dolor abdominal',
  'Disminución de movimientos fetales', 'Contracciones', 'Fiebre', 'Edema en cara/manos', 'Dolor en el pecho',
];

const ANIMO_OPCIONES = [
  { valor: 'muy_bien', emoji: '😁', label: 'Muy bien', color: 'bg-emerald-100 text-emerald-700' },
  { valor: 'bien', emoji: '😊', label: 'Bien', color: 'bg-teal-100 text-teal-700' },
  { valor: 'regular', emoji: '😐', label: 'Regular', color: 'bg-amber-100 text-amber-700' },
  { valor: 'mal', emoji: '😟', label: 'Mal', color: 'bg-orange-100 text-orange-700' },
  { valor: 'muy_mal', emoji: '😢', label: 'Muy mal', color: 'bg-red-100 text-red-700' },
];

export default function Diario() {
  const [perfil, setPerfil] = useState(null);
  const [entradas, setEntradas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState([]);
  const [form, setForm] = useState({ descripcion: '', intensidad: 5, estado_animo: 'bien' });
  const [tieneAlarma, setTieneAlarma] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1),
      base44.entities.DiarioSintomas.list('-fecha', 20),
    ]).then(([perfiles, entr]) => {
      if (perfiles.length > 0) setPerfil(perfiles[0]);
      setEntradas(entr);
    });
  }, []);

  const toggleSintoma = (s) => {
    const nuevo = sintomasSeleccionados.includes(s)
      ? sintomasSeleccionados.filter(x => x !== s)
      : [...sintomasSeleccionados, s];
    setSintomasSeleccionados(nuevo);
    setTieneAlarma(nuevo.some(x => SIGNOS_ALARMA.includes(x)));
  };

  const guardar = async () => {
    if (!perfil) return;
    const eg = calcularEdadGestacional(perfil.fecha_ultima_menstruacion);
    await base44.entities.DiarioSintomas.create({
      perfil_id: perfil.id,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      semanas_gestacion: eg?.semanas,
      sintomas: sintomasSeleccionados,
      descripcion: form.descripcion,
      intensidad: form.intensidad,
      estado_animo: form.estado_animo,
      es_alarma: tieneAlarma,
    });
    const entr = await base44.entities.DiarioSintomas.list('-fecha', 20);
    setEntradas(entr);
    setMostrarForm(false);
    setSintomasSeleccionados([]);
    setForm({ descripcion: '', intensidad: 5, estado_animo: 'bien' });
    setTieneAlarma(false);
  };

  const animoActivo = ANIMO_OPCIONES.find(a => a.valor === form.estado_animo);

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
            <BookHeart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Mi Diario</h1>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center shadow-md shadow-primary/30"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Formulario nueva entrada */}
      {mostrarForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <h3 className="font-bold text-foreground">¿Cómo te sientes hoy?</h3>

          {/* Estado de ánimo */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Estado de ánimo</p>
            <div className="flex gap-2">
              {ANIMO_OPCIONES.map(a => (
                <button key={a.valor} onClick={() => setForm(f => ({ ...f, estado_animo: a.valor }))}
                  className={cn('flex-1 flex flex-col items-center py-2 rounded-xl border-2 transition-all text-lg',
                    form.estado_animo === a.valor ? 'border-primary bg-primary/5' : 'border-transparent bg-muted')}>
                  <span>{a.emoji}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Síntomas */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Síntomas (selecciona los que tienes)</p>
            <div className="flex flex-wrap gap-2">
              {SINTOMAS_LISTA.map(s => {
                const esAlarma = SIGNOS_ALARMA.includes(s);
                const seleccionado = sintomasSeleccionados.includes(s);
                return (
                  <button key={s} onClick={() => toggleSintoma(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                      seleccionado
                        ? esAlarma ? 'bg-red-500 text-white border-red-500' : 'gradient-rose text-white border-transparent'
                        : esAlarma ? 'bg-red-50 text-red-600 border-red-200' : 'bg-muted text-muted-foreground border-transparent'
                    )}>
                    {esAlarma && seleccionado ? '⚠ ' : ''}{s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alerta de alarma */}
          {tieneAlarma && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-bold text-sm">Signos de alarma detectados</p>
                <p className="text-red-600 text-xs mt-0.5">Considera consultar al médico pronto. Ve a la sección de Alarmas para ver unidades médicas cercanas.</p>
              </div>
            </div>
          )}

          {/* Intensidad */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Intensidad del malestar: <strong>{form.intensidad}/10</strong></p>
            <input type="range" min="1" max="10" value={form.intensidad}
              onChange={e => setForm(f => ({ ...f, intensidad: parseInt(e.target.value) }))}
              className="w-full accent-primary" />
          </div>

          {/* Notas */}
          <textarea placeholder="Describe cómo te sientes, qué comiste, actividades..." value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none min-h-[80px] resize-none" />

          <button onClick={guardar} className="w-full gradient-rose text-white py-3 rounded-xl font-bold shadow-md shadow-primary/20">
            Guardar entrada
          </button>
        </div>
      )}

      {/* Historial */}
      <div className="space-y-3">
        {entradas.map((e, i) => {
          const animo = ANIMO_OPCIONES.find(a => a.valor === e.estado_animo);
          return (
            <div key={i} className={cn('bg-card rounded-2xl border p-4', e.es_alarma ? 'border-red-200 bg-red-50/50' : 'border-border')}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-sm">{e.fecha ? format(new Date(e.fecha), "EEEE dd 'de' MMMM", { locale: es }) : ''}</p>
                  <p className="text-xs text-muted-foreground">{e.hora} · Sem {e.semanas_gestacion}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {e.es_alarma && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {animo && <span className="text-xl">{animo.emoji}</span>}
                </div>
              </div>
              {e.sintomas?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {e.sintomas.map((s, j) => (
                    <span key={j} className={cn('text-xs px-2 py-0.5 rounded-full font-semibold',
                      SIGNOS_ALARMA.includes(s) ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground')}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {e.descripcion && <p className="text-sm text-muted-foreground">{e.descripcion}</p>}
            </div>
          );
        })}
        {entradas.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <BookHeart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No hay entradas aún</p>
            <p className="text-sm">Registra cómo te sientes cada día</p>
          </div>
        )}
      </div>
    </div>
  );
}