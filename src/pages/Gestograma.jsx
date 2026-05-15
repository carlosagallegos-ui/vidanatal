import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calcularEdadGestacional, calcularFPP, HITOS_FETALES } from '@/lib/gestogramaUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Baby, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRIMESTRE_INFO = [
  {
    trimestre: 1, semanas: '1-12', color: 'bg-rose-100 text-rose-700',
    titulo: 'Primer Trimestre',
    descripcion: 'Período de organogénesis. Todos los órganos del bebé se están formando.',
    cambios: ['Náuseas matutinas frecuentes', 'Cansancio intenso', 'Sensibilidad en los senos', 'Cambios de humor'],
    cuidados: ['Ácido fólico 400-800 mcg/día', 'Evitar alcohol y tabaco', 'Primera consulta prenatal', 'Análisis de sangre y orina'],
  },
  {
    trimestre: 2, semanas: '13-26', color: 'bg-violet-100 text-violet-700',
    titulo: 'Segundo Trimestre',
    descripcion: 'El período más cómodo del embarazo. El bebé crece rápidamente.',
    cambios: ['Disminuyen las náuseas', 'Se nota el crecimiento del abdomen', 'Primeros movimientos fetales', 'Más energía'],
    cuidados: ['Ultrasonido morfológico (semana 20)', 'Hierro y vitamina D', 'Ejercicio moderado', 'Curva de glucosa (sem 24-28)'],
  },
  {
    trimestre: 3, semanas: '27-40', color: 'bg-teal-100 text-teal-700',
    titulo: 'Tercer Trimestre',
    descripcion: 'El bebé aumenta de peso y se prepara para el nacimiento.',
    cambios: ['Dificultad para dormir', 'Contracciones de Braxton Hicks', 'Movimientos fetales fuertes', 'Edema en piernas'],
    cuidados: ['Monitoreo fetal regular', 'Plan de parto', 'Lactancia materna prenatal', 'Reconocer signos de parto'],
  },
];

export default function Gestograma() {
  const [perfil, setPerfil] = useState(null);
  const [hitoActivo, setHitoActivo] = useState(null);
  const [trimestreActivo, setTrimestreActivo] = useState(0);

  useEffect(() => {
    base44.entities.PerfilEmbarazo.filter({ activo: true }, '-created_date', 1)
      .then(perfiles => { if (perfiles.length > 0) setPerfil(perfiles[0]); });
  }, []);

  const eg = perfil ? calcularEdadGestacional(perfil.fecha_ultima_menstruacion) : null;
  const fpp = perfil ? calcularFPP(perfil.fecha_ultima_menstruacion) : null;
  const trimestreActual = eg ? (eg.semanas <= 12 ? 0 : eg.semanas <= 26 ? 1 : 2) : 0;
  const t = TRIMESTRE_INFO[trimestreActivo];

  const hitoActualIdx = eg ? HITOS_FETALES.findLastIndex(h => h.semana <= eg.semanas) : -1;

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
          <Baby className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Gestograma</h1>
      </div>

      {/* Edad gestacional visual */}
      {eg && (
        <div className="gradient-soft rounded-3xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Edad gestacional</p>
              <p className="text-4xl font-extrabold text-primary">{eg.semanas} sem <span className="text-2xl">{eg.dias}d</span></p>
            </div>
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(eg.semanas / 40) * 201} 201`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          {fpp && (
            <p className="text-sm text-muted-foreground">
              📅 Fecha probable de parto: <strong className="text-foreground">{format(fpp, "dd 'de' MMMM 'de' yyyy", { locale: es })}</strong>
            </p>
          )}
        </div>
      )}

      {/* Selector trimestre */}
      <div className="flex gap-2">
        {TRIMESTRE_INFO.map((t, i) => (
          <button
            key={i}
            onClick={() => setTrimestreActivo(i)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              trimestreActivo === i ? 'gradient-rose text-white shadow-md' : 'bg-muted text-muted-foreground',
              i === trimestreActual && trimestreActivo !== i && 'ring-2 ring-primary/50'
            )}
          >
            {i === 0 ? '1er' : i === 1 ? '2do' : '3er'} Trim.
          </button>
        ))}
      </div>

      {/* Info trimestre */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-bold px-2 py-1 rounded-lg', t.color)}>Semanas {t.semanas}</span>
          <h3 className="font-bold text-foreground">{t.titulo}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t.descripcion}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-foreground mb-1.5">Cambios esperados</p>
            {t.cambios.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1">
                <span className="text-primary text-xs mt-0.5">•</span>
                <span className="text-xs text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-foreground mb-1.5">Cuidados clave</p>
            {t.cuidados.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1">
                <span className="text-accent text-xs mt-0.5">✓</span>
                <span className="text-xs text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hitos fetales */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">Hitos del desarrollo</h2>
        </div>
        <div className="space-y-2">
          {HITOS_FETALES.map((hito, i) => {
            const pasado = eg && hito.semana <= eg.semanas;
            const actual = i === hitoActualIdx;
            return (
              <button
                key={i}
                onClick={() => setHitoActivo(hitoActivo === i ? null : i)}
                className={cn(
                  'w-full text-left rounded-2xl p-3 border transition-all duration-200',
                  actual ? 'gradient-rose text-white border-transparent shadow-lg' :
                  pasado ? 'bg-primary/5 border-primary/20' :
                  'bg-muted/50 border-border opacity-60'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
                    actual ? 'bg-white/20 text-white' :
                    pasado ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {hito.semana}w
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-bold text-sm', actual ? 'text-white' : 'text-foreground')}>{hito.titulo}</p>
                    {(hitoActivo === i) && (
                      <p className={cn('text-xs mt-1', actual ? 'text-white/80' : 'text-muted-foreground')}>{hito.descripcion}</p>
                    )}
                  </div>
                  {pasado && !actual && <span className="text-emerald-500 text-lg">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}