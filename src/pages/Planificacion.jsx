import { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Heart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const METODOS = [
  {
    nombre: 'DIU (Dispositivo intrauterino)',
    tipo: 'DIU de cobre o de levonorgestrel',
    eficacia: '>99%',
    inicio_parto: 'Desde 48h postparto o >4 semanas',
    inicio_cesarea: '>6 semanas',
    lactancia: 'Compatible (preferir cobre; hormonal con precaución)',
    duracion: 'Cobre: 10 años | Hormonal: 5 años',
    descripcion: 'Método de larga duración muy eficaz. Se coloca en el útero por un médico. Reversible. Ideal para espaciar embarazos 2-3 años.',
    emoji: '🔴',
    recomendado: true,
  },
  {
    nombre: 'Implante subdérmico',
    tipo: 'Etonogestrel (sólo progestágeno)',
    eficacia: '>99%',
    inicio_parto: 'Desde el primer mes postparto',
    inicio_cesarea: 'Desde el primer mes postparto',
    lactancia: 'Compatible (progestágeno no afecta la leche)',
    duracion: '3 años',
    descripcion: 'Pequeña varilla que se inserta bajo la piel del brazo. Muy discreta, eficaz y no requiere recordarlo diariamente. Completamente reversible.',
    emoji: '💊',
    recomendado: true,
  },
  {
    nombre: 'Anticonceptivos inyectables de progestágeno',
    tipo: 'Medroxiprogesterona (AMPD)',
    eficacia: '96-99%',
    inicio_parto: '6 semanas postparto (si amamanta)',
    inicio_cesarea: '6 semanas postparto',
    lactancia: 'Compatible después de las 6 semanas',
    duracion: '3 meses por inyección',
    descripcion: 'Inyección trimestral. Accesible y no requiere tomar una pastilla diaria. Puede retrasar el retorno de la menstruación.',
    emoji: '💉',
    recomendado: true,
  },
  {
    nombre: 'Preservativo masculino',
    tipo: 'Barrera',
    eficacia: '85-98%',
    inicio_parto: 'Inmediato',
    inicio_cesarea: 'Inmediato',
    lactancia: 'Compatible (no hormonal)',
    duracion: 'Por cada relación',
    descripcion: 'Método no hormonal, accesible y también protege contra ITS. Útil mientras se decide un método más eficaz de largo plazo.',
    emoji: '🛡️',
    recomendado: false,
  },
  {
    nombre: 'Píldoras de sólo progestágeno (minipíldora)',
    tipo: 'Levonorgestrel / norethindrone',
    eficacia: '91-99%',
    inicio_parto: '6 semanas postparto',
    inicio_cesarea: '6 semanas postparto',
    lactancia: 'Compatible (progestágeno no altera la leche)',
    duracion: 'Oral diaria',
    descripcion: 'Pastilla diaria sin estrógeno. Requiere tomarse a la misma hora cada día. Adecuada durante la lactancia.',
    emoji: '🌸',
    recomendado: false,
  },
  {
    nombre: 'Anticonceptivos combinados (estrógeno + progestágeno)',
    tipo: 'Pastillas, parche, anillo',
    eficacia: '91-99%',
    inicio_parto: '>6 meses postparto si amamanta',
    inicio_cesarea: '>6 meses si amamanta',
    lactancia: '⚠️ NO se recomiendan en las primeras 6 semanas; pueden reducir la producción de leche',
    duracion: 'Diaria/semanal/mensual',
    descripcion: 'Los métodos con estrógenos no son ideales durante la lactancia. Consulta con tu médico sobre el momento oportuno.',
    emoji: '⚠️',
    recomendado: false,
  },
];

const DERECHOS = [
  'Tienes derecho a decidir libremente si usar o no un método anticonceptivo.',
  'Tienes derecho a recibir información clara, completa y sin presiones.',
  'Tienes derecho a cambiar de método si no te satisface.',
  'Tienes derecho a que tu decisión sea respetada, independientemente de tu estado civil, número de hijos o creencias.',
  'Tienes derecho a servicios de planificación familiar gratuitos en el sistema de salud público.',
  'Ningún método puede ser implantado sin tu consentimiento informado y voluntario.',
];

export default function Planificacion() {
  const [metodoAbierto, setMetodoAbierto] = useState(null);
  const [seccion, setSeccion] = useState('metodos');

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Planificación Familiar</h1>
          <p className="text-xs text-muted-foreground">Información posevento obstétrico</p>
        </div>
      </div>

      {/* Mensaje */}
      <div className="gradient-soft rounded-2xl p-4 border border-border">
        <p className="font-bold text-sm text-foreground mb-1">🌱 Espaciar embarazos salva vidas</p>
        <p className="text-xs text-muted-foreground">La OMS recomienda esperar al menos <strong>18-24 meses</strong> entre el fin de un embarazo y el inicio del siguiente, para reducir riesgos tanto para la mamá como para el bebé.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['metodos', 'Métodos'], ['derechos', 'Mis derechos'], ['preguntas', 'FAQ']].map(([val, label]) => (
          <button key={val} onClick={() => setSeccion(val)}
            className={cn('flex-1 py-2 rounded-xl text-xs font-bold transition-all', seccion === val ? 'gradient-rose text-white shadow-md' : 'bg-muted text-muted-foreground')}>
            {label}
          </button>
        ))}
      </div>

      {/* Métodos */}
      {seccion === 'metodos' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Los métodos marcados con ⭐ son especialmente recomendados en el posparto y durante la lactancia.</p>
          {METODOS.map((m, i) => (
            <div key={i} className={cn('bg-card rounded-2xl border p-4', m.recomendado ? 'border-primary/30' : 'border-border')}>
              <button onClick={() => setMetodoAbierto(v => v === i ? null : i)} className="w-full text-left">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-sm">{m.nombre}</p>
                      {m.recomendado && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg font-semibold">⭐ Recomendado</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.tipo}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-emerald-600">Eficacia: {m.eficacia}</span>
                    </div>
                  </div>
                  {metodoAbierto === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {metodoAbierto === i && (
                <div className="mt-3 space-y-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{m.descripcion}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded-xl p-2">
                      <p className="font-bold text-foreground mb-0.5">Inicio tras parto vaginal</p>
                      <p className="text-muted-foreground">{m.inicio_parto}</p>
                    </div>
                    <div className="bg-muted rounded-xl p-2">
                      <p className="font-bold text-foreground mb-0.5">Inicio tras cesárea</p>
                      <p className="text-muted-foreground">{m.inicio_cesarea}</p>
                    </div>
                    <div className="bg-muted rounded-xl p-2 col-span-2">
                      <p className="font-bold text-foreground mb-0.5">💧 Lactancia</p>
                      <p className={cn('text-muted-foreground', m.lactancia.includes('⚠️') && 'text-amber-600')}>{m.lactancia}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Derechos */}
      {seccion === 'derechos' && (
        <div className="space-y-3">
          <div className="gradient-rose rounded-2xl p-4 text-white">
            <Heart className="w-6 h-6 mb-2" />
            <p className="font-bold">Tus derechos reproductivos</p>
            <p className="text-sm text-white/80 mt-1">La planificación familiar es un derecho humano. Nadie puede obligarte a usar o no usar un método anticonceptivo.</p>
          </div>
          {DERECHOS.map((d, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
              <div className="w-7 h-7 gradient-rose rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                {i + 1}
              </div>
              <p className="text-sm text-foreground">{d}</p>
            </div>
          ))}
        </div>
      )}

      {/* FAQ */}
      {seccion === 'preguntas' && (
        <div className="space-y-3">
          {[
            { p: '¿Cuándo regresa la fertilidad tras el parto?', r: 'Si no amamantas, puede regresar en 4-6 semanas. Si amamantas de forma exclusiva y frecuente, la LAM (Lactancia Amenorrea) puede retrasar la ovulación hasta 6 meses. Sin embargo, no es un método 100% confiable.' },
            { p: '¿Qué es la LAM (Método de Amenorrea de la Lactancia)?', r: 'Es un método temporal basado en 3 condiciones: bebé menor de 6 meses, lactancia exclusiva y frecuente (incluyendo noches), y ausencia de menstruación. Requiere las 3 condiciones para ser efectiva (~98%).' },
            { p: '¿Cuánto tiempo debo esperar para otro embarazo tras una cesárea?', r: 'Al menos 18-24 meses desde la cesárea anterior para que la cicatriz uterina sane completamente y reducir el riesgo de ruptura uterina en el siguiente embarazo.' },
            { p: '¿Dónde obtengo métodos anticonceptivos de forma gratuita?', r: 'En cualquier centro de salud o clínica del IMSS, ISSSTE o SEDESA. El DIU, implante e inyectables están disponibles de forma gratuita en el sistema de salud público de México.' },
          ].map((q, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4">
              <p className="font-bold text-sm text-foreground mb-2">{q.p}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{q.r}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}