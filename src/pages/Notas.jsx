import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { StickyNote, Plus, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const CATEGORIA_CONFIG = {
  pregunta: { emoji: '❓', color: 'bg-sky-100 text-sky-700', label: 'Pregunta' },
  sintoma: { emoji: '🩺', color: 'bg-rose-100 text-rose-700', label: 'Síntoma' },
  duda: { emoji: '💭', color: 'bg-violet-100 text-violet-700', label: 'Duda' },
  recordatorio: { emoji: '🔔', color: 'bg-amber-100 text-amber-700', label: 'Recordatorio' },
  otro: { emoji: '📝', color: 'bg-muted text-muted-foreground', label: 'Otro' },
};

const PRIORIDAD_CONFIG = {
  alta: 'border-l-4 border-l-red-400',
  media: 'border-l-4 border-l-amber-400',
  baja: 'border-l-4 border-l-emerald-400',
};

export default function Notas() {
  const [perfil, setPerfil] = useState(null);
  const [notas, setNotas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtro, setFiltro] = useState('pendientes');
  const [form, setForm] = useState({ texto: '', categoria: 'pregunta', prioridad: 'media' });

  useEffect(() => {
    Promise.all([
      base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1),
      base44.entities.NotasConsulta.list('-created_date', 30),
    ]).then(([perfiles, nts]) => {
      if (perfiles.length > 0) setPerfil(perfiles[0]);
      setNotas(nts);
    });
  }, []);

  const guardar = async () => {
    if (!perfil || !form.texto.trim()) return;
    await base44.entities.NotasConsulta.create({
      perfil_id: perfil.id,
      fecha_creacion: new Date().toISOString().split('T')[0],
      ...form,
      resuelta: false,
    });
    const nts = await base44.entities.NotasConsulta.list('-created_date', 30);
    setNotas(nts);
    setMostrarForm(false);
    setForm({ texto: '', categoria: 'pregunta', prioridad: 'media' });
  };

  const toggleResuelta = async (nota) => {
    await base44.entities.NotasConsulta.update(nota.id, { resuelta: !nota.resuelta });
    const nts = await base44.entities.NotasConsulta.list('-created_date', 30);
    setNotas(nts);
  };

  const eliminar = async (id) => {
    await base44.entities.NotasConsulta.delete(id);
    setNotas(nts => nts.filter(n => n.id !== id));
  };

  const notasFiltradas = filtro === 'pendientes'
    ? notas.filter(n => !n.resuelta)
    : notas.filter(n => n.resuelta);

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notas para consulta</h1>
            <p className="text-xs text-muted-foreground">No olvides ninguna duda con tu médico</p>
          </div>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Consejo */}
      <div className="gradient-soft rounded-2xl p-4 border border-border">
        <p className="text-sm text-foreground font-semibold">💡 Consejo</p>
        <p className="text-xs text-muted-foreground mt-1">Anotar tus preguntas antes de la consulta te ayuda a aprovechar mejor el tiempo con tu médico y no olvidar ningún tema importante.</p>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <textarea placeholder="¿Qué quieres preguntarle a tu médico? Escribe tu duda, síntoma o recordatorio..."
            value={form.texto}
            onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
            className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none min-h-[100px] resize-none"
            autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Categoría</label>
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none">
                {Object.entries(CATEGORIA_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.emoji} {cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Prioridad</label>
              <select value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none">
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>
            </div>
          </div>
          <button onClick={guardar} className="w-full gradient-rose text-white py-3 rounded-xl font-bold shadow-md">
            Guardar nota
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        {[['pendientes', `Pendientes (${notas.filter(n => !n.resuelta).length})`], ['resueltas', 'Resueltas']].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)}
            className={cn('flex-1 py-2 rounded-xl text-xs font-bold transition-all', filtro === val ? 'gradient-rose text-white shadow-md' : 'bg-muted text-muted-foreground')}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista de notas */}
      <div className="space-y-2">
        {notasFiltradas.map((nota, i) => {
          const cfg = CATEGORIA_CONFIG[nota.categoria] || CATEGORIA_CONFIG.otro;
          return (
            <div key={i} className={cn('bg-card rounded-2xl border border-border p-4', PRIORIDAD_CONFIG[nota.prioridad], nota.resuelta && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{cfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-lg', cfg.color)}>{cfg.label}</span>
                    {nota.fecha_creacion && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(nota.fecha_creacion), "dd/MM/yyyy", { locale: es })}
                      </span>
                    )}
                  </div>
                  <p className={cn('text-sm', nota.resuelta ? 'line-through text-muted-foreground' : 'text-foreground')}>{nota.texto}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleResuelta(nota)}
                    className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                      nota.resuelta ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => eliminar(nota.id)}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {notasFiltradas.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{filtro === 'pendientes' ? 'Sin notas pendientes' : 'Sin notas resueltas'}</p>
          </div>
        )}
      </div>
    </div>
  );
}