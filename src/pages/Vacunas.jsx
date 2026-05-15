import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularEdadGestacional } from '@/lib/gestogramaUtils';
import { Syringe, CheckCircle2, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ESQUEMA_VACUNAS = [
  {
    nombre: 'Toxoide tetánico (Td)',
    tipo: 'Td',
    semana_inicio: 14,
    semana_fin: 40,
    descripcion: 'Protege a la madre y al bebé contra el tétanos y la difteria. Se recomienda a partir de la semana 14.',
    dosis: '0.5 mL IM',
    beneficio: 'Previene el tétanos neonatal y difteria.',
    importante: true,
  },
  {
    nombre: 'Tdpa (tos ferina)',
    tipo: 'Tdpa',
    semana_inicio: 27,
    semana_fin: 36,
    descripcion: 'Cada embarazo. Recomendada entre semana 27-36. Los anticuerpos pasan al bebé y lo protegen durante los primeros meses de vida.',
    dosis: '0.5 mL IM',
    beneficio: 'Principal fuente de protección del recién nacido contra la tos ferina.',
    importante: true,
  },
  {
    nombre: 'Influenza estacional',
    tipo: 'Influenza',
    semana_inicio: 1,
    semana_fin: 40,
    descripcion: 'Puede aplicarse en cualquier trimestre durante la temporada de influenza. Las embarazadas tienen mayor riesgo de complicaciones.',
    dosis: '0.5 mL IM',
    beneficio: 'Reduce hospitalizaciones y protege al bebé los primeros 6 meses de vida.',
    importante: true,
  },
  {
    nombre: 'Hepatitis B',
    tipo: 'Hepatitis_B',
    semana_inicio: 1,
    semana_fin: 40,
    descripcion: 'Si no fue vacunada previamente o no tiene inmunidad, se recomienda especialmente en trabajadoras de salud.',
    dosis: '3 dosis (0, 1, 6 meses)',
    beneficio: 'Previene la transmisión vertical de hepatitis B.',
    importante: false,
  },
];

const DETECCIONES_INFO = [
  { titulo: 'VIH', descripcion: 'La detección oportuna permite el tratamiento antirretroviral que reduce el riesgo de transmisión al bebé de 30% a menos del 1%.', icono: '🔬', semana: 8 },
  { titulo: 'Sífilis (RPR/VDRL)', descripcion: 'La sífilis congénita es prevenible con detección y tratamiento oportuno con penicilina. Se realiza en la primera consulta y en el 3er trimestre.', icono: '🧪', semana: 8 },
  { titulo: 'Estreptococo Grupo B', descripcion: 'Tamizaje entre semana 35-37. Si es positivo, se administran antibióticos durante el trabajo de parto para proteger al bebé.', icono: '🦠', semana: 36 },
  { titulo: 'Glucosa (diabetes)', descripcion: 'Curva de tolerancia a la glucosa entre semana 24-28 para detectar diabetes gestacional. El control reduce complicaciones materno-fetales.', icono: '💉', semana: 24 },
];

export default function Vacunas() {
  const [perfil, setPerfil] = useState(null);
  const [vacunas, setVacunas] = useState([]);
  const [infoActiva, setInfoActiva] = useState(null);
  const [modalVacuna, setModalVacuna] = useState(null);
  const [form, setForm] = useState({ fecha_aplicacion: '', dosis: '', lote: '', unidad_medica: '' });

  useEffect(() => {
    Promise.all([
      base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1),
      base44.entities.Vacuna.list('-fecha_aplicacion', 20),
    ]).then(([perfiles, vacs]) => {
      if (perfiles.length > 0) setPerfil(perfiles[0]);
      setVacunas(vacs);
    });
  }, []);

  const eg = perfil ? calcularEdadGestacional(perfil.fecha_ultima_menstruacion) : null;
  const semanas = eg?.semanas || 0;

  const getVacunaAplicada = (nombre) => vacunas.find(v => v.nombre_vacuna === nombre && v.estado === 'aplicada');

  const guardarVacuna = async () => {
    if (!perfil || !modalVacuna) return;
    await base44.entities.Vacuna.create({
      perfil_id: perfil.id,
      nombre_vacuna: modalVacuna.nombre,
      tipo: modalVacuna.tipo,
      semana_recomendada_inicio: modalVacuna.semana_inicio,
      semana_recomendada_fin: modalVacuna.semana_fin,
      estado: 'aplicada',
      ...form,
    });
    const vacs = await base44.entities.Vacuna.list('-fecha_aplicacion', 20);
    setVacunas(vacs);
    setModalVacuna(null);
    setForm({ fecha_aplicacion: '', dosis: '', lote: '', unidad_medica: '' });
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
          <Syringe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vacunas y Detecciones</h1>
          <p className="text-xs text-muted-foreground">Medicina preventiva prenatal</p>
        </div>
      </div>

      {/* Esquema de vacunación */}
      <h2 className="font-bold text-foreground">Esquema de Vacunación</h2>
      <div className="space-y-3">
        {ESQUEMA_VACUNAS.map((vacuna, i) => {
          const aplicada = getVacunaAplicada(vacuna.nombre);
          const enRango = semanas >= vacuna.semana_inicio && semanas <= vacuna.semana_fin;
          return (
            <div key={i} className={cn(
              'bg-card rounded-2xl border p-4',
              aplicada ? 'border-emerald-200 bg-emerald-50/50' :
              enRango ? 'border-primary/30 bg-primary/5' : 'border-border'
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  aplicada ? 'bg-emerald-100' : enRango ? 'bg-primary/10' : 'bg-muted'
                )}>
                  {aplicada ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Syringe className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-sm">{vacuna.nombre}</p>
                    {vacuna.importante && <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-lg font-semibold">Obligatoria</span>}
                    {enRango && !aplicada && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg font-semibold">Recomendada ahora</span>}
                    {aplicada && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-lg font-semibold">✓ Aplicada</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{vacuna.descripcion}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInfoActiva(infoActiva === i ? null : i)}
                      className="text-xs flex items-center gap-1 text-primary font-semibold"
                    >
                      <Info className="w-3 h-3" /> Más info
                    </button>
                    {!aplicada && (
                      <button
                        onClick={() => setModalVacuna(vacuna)}
                        className="text-xs bg-primary text-white px-3 py-1 rounded-lg font-semibold ml-auto"
                      >
                        Registrar
                      </button>
                    )}
                  </div>
                  {infoActiva === i && (
                    <div className="mt-2 bg-muted rounded-xl p-3">
                      <p className="text-xs text-muted-foreground"><strong>Dosis:</strong> {vacuna.dosis}</p>
                      <p className="text-xs text-muted-foreground mt-1"><strong>Beneficio:</strong> {vacuna.beneficio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detecciones obligatorias */}
      <h2 className="font-bold text-foreground pt-2">Detecciones Obligatorias</h2>
      <div className="space-y-2">
        {DETECCIONES_INFO.map((d, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{d.icono}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{d.titulo}</p>
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">Sem {d.semana}</span>
                </div>
                <p className="text-xs text-muted-foreground">{d.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalVacuna && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end px-4 pb-4">
          <div className="bg-card rounded-3xl p-5 w-full max-w-lg mx-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Registrar: {modalVacuna.nombre}</h3>
              <button onClick={() => setModalVacuna(null)} className="text-muted-foreground text-xl">×</button>
            </div>
            {[
              { label: 'Fecha de aplicación', key: 'fecha_aplicacion', type: 'date' },
              { label: 'Dosis', key: 'dosis', type: 'text', placeholder: '0.5 mL' },
              { label: 'Número de lote', key: 'lote', type: 'text', placeholder: 'Opcional' },
              { label: 'Unidad médica', key: 'unidad_medica', type: 'text', placeholder: 'Centro de salud' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm border border-border focus:outline-none" />
              </div>
            ))}
            <button onClick={guardarVacuna} className="w-full gradient-rose text-white py-3 rounded-xl font-bold shadow-md">
              Guardar vacuna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}