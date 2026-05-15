import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularEdadGestacional } from '@/lib/gestogramaUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Heart, Plus, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ControlPrenatal() {
  const [perfil, setPerfil] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [graficaActiva, setGraficaActiva] = useState('peso');
  const [form, setForm] = useState({ peso_kg: '', presion_sistolica: '', presion_diastolica: '', altura_uterina_cm: '', frecuencia_cardiaca_fetal: '', edema: 'ausente', notas_clinicas: '', tipo_registro: 'automedicion' });

  useEffect(() => {
    Promise.all([
      base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1),
      base44.entities.ConsultaPrenatal.list('-fecha', 20),
    ]).then(([perfiles, cons]) => {
      if (perfiles.length > 0) setPerfil(perfiles[0]);
      setConsultas(cons.reverse());
    });
  }, []);

  const eg = perfil ? calcularEdadGestacional(perfil.fecha_ultima_menstruacion) : null;

  const guardar = async () => {
    if (!perfil) return;
    const data = { ...form, perfil_id: perfil.id, fecha: new Date().toISOString().split('T')[0] };
    if (eg) { data.semanas_gestacion = eg.semanas; data.dias_gestacion = eg.dias; }
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
    await base44.entities.ConsultaPrenatal.create(data);
    const cons = await base44.entities.ConsultaPrenatal.list('-fecha', 20);
    setConsultas(cons.reverse());
    setMostrarForm(false);
    setForm({ peso_kg: '', presion_sistolica: '', presion_diastolica: '', altura_uterina_cm: '', frecuencia_cardiaca_fetal: '', edema: 'ausente', notas_clinicas: '', tipo_registro: 'automedicion' });
  };

  const datosGrafica = consultas.map(c => ({
    fecha: c.fecha ? format(new Date(c.fecha), 'dd/MM', { locale: es }) : '',
    peso: c.peso_kg,
    sistolica: c.presion_sistolica,
    diastolica: c.presion_diastolica,
    semana: c.semanas_gestacion,
  })).filter(d => d[graficaActiva] !== undefined && d[graficaActiva] !== null);

  const ultima = consultas[consultas.length - 1];

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Control Prenatal</h1>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center shadow-md shadow-primary/30"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Últimos valores */}
      {ultima && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Peso', value: ultima.peso_kg ? `${ultima.peso_kg} kg` : '--', icon: '⚖️' },
            { label: 'Presión', value: ultima.presion_sistolica ? `${ultima.presion_sistolica}/${ultima.presion_diastolica}` : '--', icon: '💓' },
            { label: 'FCF', value: ultima.frecuencia_cardiaca_fetal ? `${ultima.frecuencia_cardiaca_fetal} lpm` : '--', icon: '🎵' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-3 text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="font-bold text-foreground">Nueva medición</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Peso (kg)', key: 'peso_kg', placeholder: '65.5' },
              { label: 'Presión sistólica', key: 'presion_sistolica', placeholder: '120' },
              { label: 'Presión diastólica', key: 'presion_diastolica', placeholder: '80' },
              { label: 'Altura uterina (cm)', key: 'altura_uterina_cm', placeholder: '28' },
              { label: 'FCF (lpm)', key: 'frecuencia_cardiaca_fetal', placeholder: '140' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
                <input
                  type="number"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm font-semibold border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Edema</label>
              <select
                value={form.edema}
                onChange={e => setForm(f => ({ ...f, edema: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm font-semibold border border-border focus:outline-none"
              >
                <option value="ausente">Ausente</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="severo">Severo</option>
              </select>
            </div>
          </div>
          <textarea
            placeholder="Notas adicionales..."
            value={form.notas_clinicas}
            onChange={e => setForm(f => ({ ...f, notas_clinicas: e.target.value }))}
            className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] resize-none"
          />
          <button onClick={guardar} className="w-full gradient-rose text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary/20">
            Guardar medición
          </button>
        </div>
      )}

      {/* Gráficas */}
      {consultas.length > 1 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Evolución</h3>
          </div>
          <div className="flex gap-2 mb-4">
            {[['peso', 'Peso'], ['sistolica', 'T/A Sistólica'], ['diastolica', 'T/A Diastólica']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setGraficaActiva(key)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-bold transition-all', graficaActiva === key ? 'gradient-rose text-white' : 'bg-muted text-muted-foreground')}
              >
                {label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={datosGrafica}>
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              {graficaActiva === 'sistolica' && <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="4 4" />}
              {graficaActiva === 'diastolica' && <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey={graficaActiva} stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historial */}
      <div>
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Historial
        </h3>
        <div className="space-y-2">
          {[...consultas].reverse().map((c, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">{c.fecha ? format(new Date(c.fecha), "dd 'de' MMMM", { locale: es }) : ''}</p>
                  {c.semanas_gestacion && <p className="text-xs text-muted-foreground">Semana {c.semanas_gestacion}</p>}
                </div>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg', c.tipo_registro === 'consulta' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600')}>
                  {c.tipo_registro === 'consulta' ? 'Consulta' : 'Automedición'}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {c.peso_kg && <span>⚖️ {c.peso_kg} kg</span>}
                {c.presion_sistolica && <span>💓 {c.presion_sistolica}/{c.presion_diastolica}</span>}
                {c.frecuencia_cardiaca_fetal && <span>🎵 {c.frecuencia_cardiaca_fetal} lpm</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}