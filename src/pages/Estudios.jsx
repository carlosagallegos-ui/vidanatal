import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FlaskConical, Plus, Upload, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ESTUDIOS_BASE = [
  { nombre: 'BHC (Biometría Hemática)', trimestre: 1, categoria: 'laboratorio', ref_min: null, ref_max: null },
  { nombre: 'Glucosa en ayuno', trimestre: 1, categoria: 'laboratorio', ref_min: 70, ref_max: 92 },
  { nombre: 'Urocultivo y EGO', trimestre: 1, categoria: 'laboratorio' },
  { nombre: 'Grupo y Rh', trimestre: 1, categoria: 'laboratorio' },
  { nombre: 'VIH (ELISA)', trimestre: 1, categoria: 'laboratorio' },
  { nombre: 'RPR/VDRL (Sífilis)', trimestre: 1, categoria: 'laboratorio' },
  { nombre: 'Ultrasonido 1er trimestre', trimestre: 1, semana: 12, categoria: 'ultrasonido' },
  { nombre: 'Ultrasonido morfológico', trimestre: 2, semana: 20, categoria: 'ultrasonido' },
  { nombre: 'Curva de tolerancia a la glucosa (75g)', trimestre: 2, semana: 24, categoria: 'laboratorio', ref_min: null, ref_max: 140 },
  { nombre: 'Hemoglobina / Hematocrito', trimestre: 2, categoria: 'laboratorio', ref_min: 11, ref_max: null },
  { nombre: 'Proteínas en orina de 24h', trimestre: 2, categoria: 'laboratorio', ref_max: 300 },
  { nombre: 'Cultivo Estreptococo Grupo B', trimestre: 3, semana: 36, categoria: 'laboratorio' },
  { nombre: 'Ultrasonido obstétrico 3er trimestre', trimestre: 3, semana: 34, categoria: 'ultrasonido' },
  { nombre: 'Perfil biofísico fetal', trimestre: 3, semana: 38, categoria: 'ultrasonido' },
];

const ESTADO_CONFIG = {
  normal: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Normal' },
  alterado: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Alterado' },
  critico: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Crítico' },
  pendiente: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pendiente' },
};

export default function Estudios() {
  const [perfil, setPerfil] = useState(null);
  const [estudios, setEstudios] = useState([]);
  const [modalEstudio, setModalEstudio] = useState(null);
  const [filtroTrimestre, setFiltroTrimestre] = useState('todos');
  const [form, setForm] = useState({ resultado_texto: '', resultado_numerico: '', fecha_realizacion: '', notas: '', estado_resultado: 'pendiente' });
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1),
      base44.entities.EstudioLaboratorio.list('-fecha_realizacion', 50),
    ]).then(([perfiles, est]) => {
      if (perfiles.length > 0) setPerfil(perfiles[0]);
      setEstudios(est);
    });
  }, []);

  const getEstudioGuardado = (nombre) => estudios.find(e => e.nombre_estudio === nombre);

  const [guardando, setGuardando] = useState(false);

  const guardarResultado = async () => {
    if (!perfil || !modalEstudio) return;
    setGuardando(true);
    const existente = getEstudioGuardado(modalEstudio.nombre);
    const data = {
      perfil_id: perfil.id,
      nombre_estudio: modalEstudio.nombre,
      categoria: modalEstudio.categoria,
      trimestre_recomendado: modalEstudio.trimestre,
      semana_recomendada: modalEstudio.semana || null,
      valor_referencia_min: modalEstudio.ref_min || null,
      valor_referencia_max: modalEstudio.ref_max || null,
      fecha_realizacion: form.fecha_realizacion || null,
      resultado_texto: form.resultado_texto || null,
      resultado_numerico: form.resultado_numerico ? parseFloat(form.resultado_numerico) : null,
      notas: form.notas || null,
      estado_resultado: form.estado_resultado,
      archivo_url: form.archivo_url || null,
    };
    if (existente) {
      await base44.entities.EstudioLaboratorio.update(existente.id, data);
    } else {
      await base44.entities.EstudioLaboratorio.create(data);
    }
    const est = await base44.entities.EstudioLaboratorio.list('-fecha_realizacion', 50);
    setEstudios(est);
    setGuardando(false);
    setModalEstudio(null);
  };

  const subirArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, archivo_url: file_url }));
    setSubiendo(false);
  };

  const listaFiltrada = filtroTrimestre === 'todos'
    ? ESTUDIOS_BASE
    : ESTUDIOS_BASE.filter(e => e.trimestre === parseInt(filtroTrimestre));

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Estudios y Laboratorio</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[['todos', 'Todos'], ['1', '1er Trim.'], ['2', '2do Trim.'], ['3', '3er Trim.']].map(([val, label]) => (
          <button key={val} onClick={() => setFiltroTrimestre(val)}
            className={cn('flex-1 py-2 rounded-xl text-xs font-bold transition-all', filtroTrimestre === val ? 'gradient-rose text-white shadow-md' : 'bg-muted text-muted-foreground')}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista de estudios */}
      <div className="space-y-2">
        {listaFiltrada.map((estudio, i) => {
          const guardado = getEstudioGuardado(estudio.nombre);
          const estado = guardado?.estado_resultado || 'pendiente';
          const cfg = ESTADO_CONFIG[estado];
          const Icon = cfg.icon;
          return (
            <button
              key={i}
              onClick={() => {
                setModalEstudio(estudio);
                setForm(guardado ? {
                  resultado_texto: guardado.resultado_texto || '',
                  resultado_numerico: guardado.resultado_numerico?.toString() || '',
                  fecha_realizacion: guardado.fecha_realizacion || '',
                  notas: guardado.notas || '',
                  estado_resultado: guardado.estado_resultado || 'pendiente',
                  archivo_url: guardado.archivo_url || '',
                } : { resultado_texto: '', resultado_numerico: '', fecha_realizacion: '', notas: '', estado_resultado: 'pendiente' });
              }}
              className="w-full bg-card rounded-2xl border border-border p-4 text-left transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                  <Icon className={cn('w-4 h-4', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-foreground truncate">{estudio.nombre}</p>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0', cfg.bg, cfg.color)}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Trimestre {estudio.trimestre}{estudio.semana ? ` · Sem ${estudio.semana}` : ''}
                  </p>
                  {guardado?.resultado_numerico && (
                    <p className="text-xs font-semibold text-foreground mt-1">
                      Resultado: {guardado.resultado_numerico} {guardado.unidad || ''}
                      {estudio.ref_max && guardado.resultado_numerico > estudio.ref_max && <span className="text-red-500 ml-1">⚠ Alto</span>}
                      {estudio.ref_min && guardado.resultado_numerico < estudio.ref_min && <span className="text-amber-500 ml-1">⚠ Bajo</span>}
                    </p>
                  )}
                  {guardado?.resultado_texto && !guardado?.resultado_numerico && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{guardado.resultado_texto}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal captura resultado */}
      {modalEstudio && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end px-4 pb-4">
          <div className="bg-card rounded-3xl p-5 w-full max-w-lg mx-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">{modalEstudio.nombre}</h3>
              <button onClick={() => setModalEstudio(null)} className="text-muted-foreground text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Fecha de realización</label>
                <input type="date" value={form.fecha_realizacion} onChange={e => setForm(f => ({ ...f, fecha_realizacion: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Resultado numérico</label>
                <input type="number" placeholder="p.ej. 95" value={form.resultado_numerico} onChange={e => setForm(f => ({ ...f, resultado_numerico: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Estado</label>
                <select value={form.estado_resultado} onChange={e => setForm(f => ({ ...f, estado_resultado: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none">
                  <option value="normal">Normal</option>
                  <option value="alterado">Alterado</option>
                  <option value="critico">Crítico</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Resultado / descripción</label>
                <textarea placeholder="Escribe el resultado..." value={form.resultado_texto} onChange={e => setForm(f => ({ ...f, resultado_texto: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none min-h-[70px] resize-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Notas adicionales</label>
                <textarea placeholder="Observaciones, indicaciones del médico..." value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none min-h-[60px] resize-none" />
              </div>
            </div>
            <label className={cn('flex items-center gap-2 border-2 border-dashed border-border rounded-xl p-3 cursor-pointer', subiendo && 'opacity-50')}>
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{form.archivo_url ? '✓ Archivo cargado' : subiendo ? 'Subiendo...' : 'Adjuntar documento/imagen'}</span>
              <input type="file" accept="image/*,.pdf" onChange={subirArchivo} className="hidden" disabled={subiendo} />
            </label>
            {form.archivo_url && (
              <a href={form.archivo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm font-semibold">
                <FileText className="w-4 h-4" /> Ver documento adjunto
              </a>
            )}
            <button onClick={guardarResultado} disabled={guardando} className="w-full gradient-rose text-white py-3 rounded-xl font-bold shadow-md shadow-primary/20 disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Guardar resultado'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}