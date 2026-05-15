import { useState } from 'react';
import { Milk, ChevronDown, ChevronUp, Heart, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BENEFICIOS = [
  { titulo: 'Para el bebé', items: ['Mejor sistema inmune: menos infecciones respiratorias y gastrointestinales', 'Menor riesgo de alergias y asma', 'Mejor desarrollo cerebral y cognitivo', 'Protección contra diabetes y obesidad en la infancia', 'Vínculo afectivo más fuerte con la mamá'] },
  { titulo: 'Para la mamá', items: ['Recuperación uterina más rápida tras el parto', 'Menor riesgo de cáncer de mama y ovario', 'Ayuda a perder el peso gestacional', 'Reduce el riesgo de depresión posparto', 'Es económica y siempre disponible'] },
];

const TECNICAS = [
  { nombre: 'Posición de cuna', descripcion: 'La más clásica. El bebé yace en tus brazos, su barriga contra tu cuerpo. Ideal para recién nacidos.', emoji: '🤱' },
  { nombre: 'Posición de sandía o rugby', descripcion: 'El bebé queda bajo tu brazo como un balón de fútbol americano. Útil después de cesárea o con gemelos.', emoji: '🏈' },
  { nombre: 'Posición recostada', descripcion: 'Mamá y bebé yacen de lado frente a frente. Ideal para tomas nocturnas.', emoji: '😴' },
  { nombre: 'Posición biológica / crianza ecológica', descripcion: 'Mamá reclinada, bebé boca abajo sobre el pecho. Estimula los reflejos innatos del bebé.', emoji: '💚' },
];

const MITOS = [
  { mito: '"Tengo poca leche para alimentar a mi bebé"', realidad: 'La producción de leche funciona por oferta y demanda. Cuanto más mama el bebé, más leche produces. La mayoría de las mamás produce exactamente lo que su bebé necesita.' },
  { mito: '"Con pechos pequeños no puedo lactar"', realidad: 'El tamaño del seno no tiene relación con la capacidad de producir leche. El tejido glandular (no la grasa) es lo que produce la leche.' },
  { mito: '"El dolor al amamantar es normal"', realidad: 'Lactar no debe doler. Si duele, generalmente es por un mal agarre. Un asesor en lactancia puede corregirlo fácilmente.' },
  { mito: '"La leche materna no alimenta después de los 6 meses"', realidad: 'La leche materna sigue siendo nutritiva todo el tiempo que se amamanta. La OMS recomienda lactancia exclusiva los primeros 6 meses y complementada hasta los 2 años.' },
  { mito: '"Si estoy enferma debo dejar de amamantar"', realidad: 'En la mayoría de las enfermedades comunes (gripe, resfriado) puedes seguir amamantando. Los anticuerpos en tu leche protegen al bebé.' },
];

const PREGUNTAS = [
  { pregunta: '¿Cuándo debo iniciar la lactancia?', respuesta: 'Lo ideal es iniciarla dentro de la primera hora después del parto, con el contacto piel a piel. El calostro, aunque es poco volumen, contiene nutrientes y anticuerpos esenciales para tu bebé.' },
  { pregunta: '¿Con qué frecuencia debo amamantar?', respuesta: 'Los recién nacidos comen de 8 a 12 veces en 24 horas (cada 1.5 a 3 horas). Amamanta a libre demanda: cuando el bebé muestre señales de hambre (movimientos de búsqueda, llevarse la mano a la boca).' },
  { pregunta: '¿Cómo sé si mi bebé está comiendo suficiente?', respuesta: 'Señales de buena alimentación: al menos 6 pañales mojados por día después del 4to-5to día, buen aumento de peso y bebé que se ve satisfecho después de las tomas.' },
  { pregunta: '¿Puedo tomar medicamentos mientras amamanto?', respuesta: 'Muchos medicamentos son compatibles con la lactancia. Siempre consulta con tu médico antes de tomar cualquier fármaco y menciona que estás amamantando.' },
  { pregunta: '¿Qué es y cómo sé si hay mastitis?', respuesta: 'La mastitis es una inflamación del seno que puede ir acompañada de fiebre, enrojecimiento y dolor intenso. Continúa amamantando (vacía el seno), aplica calor y consulta con tu médico para tratamiento.' },
];

export default function Lactancia() {
  const [seccionAbierta, setSeccionAbierta] = useState(null);
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  const toggle = (id) => setSeccionAbierta(v => v === id ? null : id);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center shadow-md shadow-primary/30">
          <Milk className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Lactancia Materna</h1>
          <p className="text-xs text-muted-foreground">El mejor inicio para tu bebé</p>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="gradient-rose rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
        <Heart className="w-8 h-8 mb-2 opacity-80" />
        <p className="font-bold text-lg mb-1">La leche materna es perfecta</p>
        <p className="text-sm text-white/85">Es el alimento ideal para tu bebé: tiene los nutrientes exactos, anticuerpos únicos y crea un vínculo insustituible. ¡Tú puedes!</p>
      </div>

      {/* Beneficios */}
      <button onClick={() => toggle('beneficios')} className="w-full bg-card rounded-2xl border border-border p-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="font-bold text-foreground">Beneficios de la lactancia</h3>
          </div>
          {seccionAbierta === 'beneficios' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
        {seccionAbierta === 'beneficios' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {BENEFICIOS.map((b, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs font-bold text-primary">{b.titulo}</p>
                {b.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Técnicas */}
      <button onClick={() => toggle('tecnicas')} className="w-full bg-card rounded-2xl border border-border p-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤱</span>
            <h3 className="font-bold text-foreground">Posiciones para amamantar</h3>
          </div>
          {seccionAbierta === 'tecnicas' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
        {seccionAbierta === 'tecnicas' && (
          <div className="mt-4 space-y-3">
            {TECNICAS.map((t, i) => (
              <div key={i} className="bg-muted rounded-xl p-3 flex items-start gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <p className="font-bold text-sm">{t.nombre}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Mitos */}
      <button onClick={() => toggle('mitos')} className="w-full bg-card rounded-2xl border border-border p-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="font-bold text-foreground">Mitos y verdades</h3>
          </div>
          {seccionAbierta === 'mitos' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
        {seccionAbierta === 'mitos' && (
          <div className="mt-4 space-y-3">
            {MITOS.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="bg-red-50 rounded-xl p-2.5">
                  <p className="text-xs font-bold text-red-700">❌ Mito: {m.mito}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2.5">
                  <p className="text-xs text-emerald-800"><strong>✅ Realidad:</strong> {m.realidad}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Preguntas frecuentes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">❓</span>
          <h3 className="font-bold text-foreground">Preguntas frecuentes</h3>
        </div>
        <div className="space-y-2">
          {PREGUNTAS.map((p, i) => (
            <button key={i} onClick={() => setPreguntaAbierta(v => v === i ? null : i)}
              className="w-full text-left bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-foreground">{p.pregunta}</p>
                {preguntaAbierta === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
              </div>
              {preguntaAbierta === i && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{p.respuesta}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}