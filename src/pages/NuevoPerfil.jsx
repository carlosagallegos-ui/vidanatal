import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { calcularFPP } from '@/lib/gestogramaUtils';
import { Baby, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const PASOS = [
  { titulo: 'Tu nombre', descripcion: '¿Cómo quieres que te llamemos?' },
  { titulo: 'Tu embarazo', descripcion: 'Información sobre tu embarazo actual' },
  { titulo: 'Antecedentes', descripcion: 'Tu historial obstétrico' },
  { titulo: 'Datos clínicos', descripcion: 'Información médica importante' },
];

export default function NuevoPerfil() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [metodo, setMetodo] = useState('FUM');
  const [form, setForm] = useState({
    nombre: '', fecha_nacimiento: '', fecha_ultima_menstruacion: '', fecha_probable_parto: '',
    numero_gestas: '', partos_previos: '', cesareas_previas: '', abortos_previos: '',
    grupo_sanguineo: '', rh: 'positivo', alergias: '', enfermedades_previas: '',
    talla_cm: '', peso_pregestacional: '',
  });

  const actualizar = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const fppCalculada = form.fecha_ultima_menstruacion ? calcularFPP(form.fecha_ultima_menstruacion) : null;

  const guardar = async () => {
    setGuardando(true);
    const data = { ...form, activo: true, metodo_calculo: metodo };
    if (fppCalculada && metodo === 'FUM') data.fecha_probable_parto = format(fppCalculada, 'yyyy-MM-dd');
    Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === null) delete data[k]; });
    if (data.numero_gestas) data.numero_gestas = parseInt(data.numero_gestas);
    if (data.partos_previos) data.partos_previos = parseInt(data.partos_previos);
    if (data.cesareas_previas) data.cesareas_previas = parseInt(data.cesareas_previas);
    if (data.abortos_previos) data.abortos_previos = parseInt(data.abortos_previos);
    if (data.talla_cm) data.talla_cm = parseFloat(data.talla_cm);
    if (data.peso_pregestacional) data.peso_pregestacional = parseFloat(data.peso_pregestacional);
    await base44.entities.PerfilEmbarazo.create(data);
    setGuardando(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen px-4 pt-8 pb-6 flex flex-col">
      {/* Header con progreso */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Crear mi perfil</h1>
        </div>
        <div className="flex gap-1.5">
          {PASOS.map((_, i) => (
            <div key={i} className={cn('flex-1 h-1.5 rounded-full transition-all duration-300', i <= paso ? 'gradient-rose' : 'bg-muted')} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{paso + 1} de {PASOS.length} — {PASOS[paso].titulo}</p>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold mb-1">{PASOS[paso].titulo}</h2>
        <p className="text-sm text-muted-foreground mb-5">{PASOS[paso].descripcion}</p>

        {/* Paso 0: Nombre */}
        {paso === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Nombre completo *</label>
              <input value={form.nombre} onChange={e => actualizar('nombre', e.target.value)}
                placeholder="Ej: María García López"
                className="w-full bg-muted rounded-2xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Fecha de nacimiento</label>
              <input type="date" value={form.fecha_nacimiento} onChange={e => actualizar('fecha_nacimiento', e.target.value)}
                className="w-full bg-muted rounded-2xl px-4 py-3 text-sm border border-border focus:outline-none" />
            </div>
          </div>
        )}

        {/* Paso 1: Embarazo */}
        {paso === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">¿Cómo calcular tu edad gestacional?</label>
              <div className="flex gap-2">
                {[['FUM', 'Por FUM'], ['FPP', 'Por FPP']].map(([val, label]) => (
                  <button key={val} onClick={() => setMetodo(val)}
                    className={cn('flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
                      metodo === val ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted text-muted-foreground')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {metodo === 'FUM' ? (
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Fecha de última menstruación (FUM) *</label>
                <input type="date" value={form.fecha_ultima_menstruacion} onChange={e => actualizar('fecha_ultima_menstruacion', e.target.value)}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm border border-border focus:outline-none" />
                {fppCalculada && (
                  <div className="mt-3 bg-primary/5 rounded-2xl p-3">
                    <p className="text-sm font-bold text-primary">🎉 Fecha probable de parto calculada:</p>
                    <p className="text-lg font-extrabold text-foreground mt-1">{format(fppCalculada, "dd 'de' MMMM 'de' yyyy")}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Fecha probable de parto (FPP) *</label>
                <input type="date" value={form.fecha_probable_parto} onChange={e => actualizar('fecha_probable_parto', e.target.value)}
                  className="w-full bg-muted rounded-2xl px-4 py-3 text-sm border border-border focus:outline-none" />
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Antecedentes */}
        {paso === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Incluye este embarazo en el total de gestas.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total de gestas', key: 'numero_gestas', placeholder: 'Ej: 2' },
                { label: 'Partos vaginales', key: 'partos_previos', placeholder: 'Ej: 1' },
                { label: 'Cesáreas previas', key: 'cesareas_previas', placeholder: 'Ej: 0' },
                { label: 'Abortos', key: 'abortos_previos', placeholder: 'Ej: 0' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{label}</label>
                  <input type="number" min="0" placeholder={placeholder} value={form[key]} onChange={e => actualizar(key, e.target.value)}
                    className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Datos clínicos */}
        {paso === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Grupo sanguíneo</label>
                <select value={form.grupo_sanguineo} onChange={e => actualizar('grupo_sanguineo', e.target.value)}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none">
                  <option value="">Seleccionar</option>
                  {['A', 'B', 'AB', 'O'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Factor Rh</label>
                <select value={form.rh} onChange={e => actualizar('rh', e.target.value)}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none">
                  <option value="positivo">Positivo (+)</option>
                  <option value="negativo">Negativo (−)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Talla (cm)</label>
                <input type="number" placeholder="160" value={form.talla_cm} onChange={e => actualizar('talla_cm', e.target.value)}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Peso pregestacional (kg)</label>
                <input type="number" placeholder="60" value={form.peso_pregestacional} onChange={e => actualizar('peso_pregestacional', e.target.value)}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Alergias conocidas</label>
              <input placeholder="Ej: penicilina, AINES..." value={form.alergias} onChange={e => actualizar('alergias', e.target.value)}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Enfermedades crónicas o antecedentes</label>
              <textarea placeholder="Ej: hipertensión, diabetes, hipotiroidismo..." value={form.enfermedades_previas}
                onChange={e => actualizar('enfermedades_previas', e.target.value)}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none min-h-[80px] resize-none" />
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        {paso > 0 && (
          <button onClick={() => setPaso(p => p - 1)}
            className="flex items-center gap-2 px-5 py-3 bg-muted text-foreground rounded-2xl font-bold text-sm">
            <ChevronLeft className="w-4 h-4" /> Atrás
          </button>
        )}
        {paso < PASOS.length - 1 ? (
          <button
            onClick={() => setPaso(p => p + 1)}
            disabled={paso === 0 && !form.nombre.trim()}
            className="flex-1 flex items-center justify-center gap-2 gradient-rose text-white py-3 rounded-2xl font-bold shadow-md shadow-primary/20 disabled:opacity-50"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={guardar} disabled={guardando}
            className="flex-1 gradient-rose text-white py-3 rounded-2xl font-bold shadow-md shadow-primary/20">
            {guardando ? 'Guardando...' : '¡Comenzar mi seguimiento!'}
          </button>
        )}
      </div>
    </div>
  );
}