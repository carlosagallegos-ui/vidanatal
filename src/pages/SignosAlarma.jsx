import { useState } from 'react';
import { AlertTriangle, MapPin, Phone, Navigation, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const SIGNOS = [
  { signo: 'Sangrado vaginal activo', descripcion: 'Cualquier sangrado durante el embarazo requiere evaluación urgente.', nivel: 'urgente' },
  { signo: 'Dolor de cabeza intenso y persistente', descripcion: 'Especialmente si no cede con analgésicos comunes o va acompañado de visión borrosa.', nivel: 'urgente' },
  { signo: 'Visión borrosa o pérdida súbita de visión', descripcion: 'Puede indicar preeclampsia severa.', nivel: 'urgente' },
  { signo: 'Disminución o ausencia de movimientos fetales', descripcion: 'Después de la semana 22, debes sentir al menos 10 movimientos en 2 horas.', nivel: 'urgente' },
  { signo: 'Contracciones antes de la semana 37', descripcion: 'Contracciones regulares antes del término pueden indicar parto prematuro.', nivel: 'urgente' },
  { signo: 'Dolor abdominal intenso', descripcion: 'Dolor que no cede o se acompaña de rigidez abdominal.', nivel: 'urgente' },
  { signo: 'Fiebre mayor de 38°C', descripcion: 'La fiebre durante el embarazo puede afectar al bebé y requiere atención.', nivel: 'importante' },
  { signo: 'Edema súbito en cara, manos o pies', descripcion: 'Especialmente si aparece de forma repentina, puede indicar preeclampsia.', nivel: 'importante' },
  { signo: 'Dificultad para respirar', descripcion: 'Falta de aire que no mejora con el reposo.', nivel: 'importante' },
  { signo: 'Dolor intenso al orinar o sangre en orina', descripcion: 'Puede indicar infección de vías urinarias severa.', nivel: 'importante' },
  { signo: 'Zumbidos en los oídos o "ver estrellas"', descripcion: 'Signo de alarma para preeclampsia o hipertensión.', nivel: 'importante' },
  { signo: 'Náuseas y vómitos muy intensos', descripcion: 'Que impidan beber líquidos y comer por más de 24 horas.', nivel: 'consultar' },
  { signo: 'Flujo vaginal con mal olor o diferente al habitual', descripcion: 'Puede indicar infección que requiere tratamiento.', nivel: 'consultar' },
  { signo: 'Caída o golpe en el abdomen', descripcion: 'Cualquier traumatismo abdominal debe ser evaluado.', nivel: 'consultar' },
];

const UNIDADES_MOCK = [
  { nombre: 'Hospital General "Dr. Manuel Gea González"', tipo: 'Hospital de 3er nivel', distancia: '1.2 km', telefono: '55 4000 3000' },
  { nombre: 'Clínica IMSS No. 12 - Urgencias Obstétricas', tipo: 'IMSS - 2do nivel', distancia: '2.1 km', telefono: '800 623 2323' },
  { nombre: 'Centro de Salud Materno Infantil', tipo: '1er nivel - SEDESA', distancia: '0.8 km', telefono: '55 5280 0049' },
  { nombre: 'Hospital de la Mujer', tipo: 'Hospital especializado', distancia: '3.5 km', telefono: '55 5140 2900' },
];

const NIVEL_CONFIG = {
  urgente: { color: 'border-l-red-500 bg-red-50', badge: 'bg-red-100 text-red-700', label: '🚨 Urgente' },
  importante: { color: 'border-l-amber-500 bg-amber-50', badge: 'bg-amber-100 text-amber-700', label: '⚠️ Importante' },
  consultar: { color: 'border-l-sky-400 bg-sky-50', badge: 'bg-sky-100 text-sky-700', label: '💬 Consultar' },
};

export default function SignosAlarma() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [mostrarUnidades, setMostrarUnidades] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const toggleSigno = (s) => {
    setSeleccionados(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const tieneUrgentes = seleccionados.some(s => {
    const signo = SIGNOS.find(sg => sg.signo === s);
    return signo?.nivel === 'urgente';
  });

  const buscarUnidades = () => {
    setBuscando(true);
    setTimeout(() => { setBuscando(false); setMostrarUnidades(true); }, 1500);
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-md shadow-red-500/30">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Signos de Alarma</h1>
          <p className="text-xs text-muted-foreground">Identifica señales que requieren atención urgente</p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-amber-800 mb-1">¿Cómo usar esta sección?</p>
        <p className="text-xs text-amber-700">Marca los síntomas que estás experimentando ahora mismo. Si tienes signos urgentes, la app te ayudará a encontrar la unidad médica más cercana.</p>
      </div>

      {/* Lista de signos */}
      <div className="space-y-2">
        {['urgente', 'importante', 'consultar'].map(nivel => (
          <div key={nivel}>
            <p className={cn('text-xs font-bold mb-2 px-2 py-1 rounded-lg inline-block', NIVEL_CONFIG[nivel].badge)}>
              {NIVEL_CONFIG[nivel].label}
            </p>
            <div className="space-y-1.5">
              {SIGNOS.filter(s => s.nivel === nivel).map((s, i) => {
                const marcado = seleccionados.includes(s.signo);
                return (
                  <button key={i} onClick={() => toggleSigno(s.signo)}
                    className={cn(
                      'w-full text-left rounded-2xl border-l-4 p-3 transition-all duration-200',
                      marcado
                        ? nivel === 'urgente' ? 'bg-red-100 border-l-red-600 border border-red-200' :
                          nivel === 'importante' ? 'bg-amber-100 border-l-amber-600 border border-amber-200' :
                          'bg-sky-100 border-l-sky-600 border border-sky-200'
                        : NIVEL_CONFIG[nivel].color + ' border border-transparent'
                    )}>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all',
                        marcado ? 'border-current bg-current' : 'border-current bg-transparent')}>
                        {marcado && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{s.signo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.descripcion}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Resultado y acción */}
      {seleccionados.length > 0 && (
        <div className={cn('rounded-2xl p-4 border', tieneUrgentes ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300')}>
          <p className={cn('font-bold text-sm mb-2', tieneUrgentes ? 'text-red-800' : 'text-amber-800')}>
            {tieneUrgentes ? '🚨 Tienes signos de alarma URGENTES' : '⚠️ Tienes signos que requieren atención'}
          </p>
          <p className={cn('text-xs mb-3', tieneUrgentes ? 'text-red-700' : 'text-amber-700')}>
            {tieneUrgentes
              ? 'Ve a urgencias de inmediato. Marca los signos que tienes y muéstraselos al médico.'
              : 'Comunícate con tu médico o centro de salud lo antes posible.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={buscarUnidades}
              disabled={buscando}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white',
                tieneUrgentes ? 'bg-red-500 shadow-md shadow-red-500/30' : 'bg-amber-500 shadow-md shadow-amber-500/30')}>
              {buscando ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Buscando...</span>
              ) : (
                <><MapPin className="w-4 h-4" /> Unidades cercanas</>
              )}
            </button>
            <a href="tel:911" className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold">
              <Phone className="w-4 h-4" /> 911
            </a>
          </div>
        </div>
      )}

      {/* Unidades médicas */}
      {mostrarUnidades && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Unidades médicas cercanas</h3>
          </div>
          {UNIDADES_MOCK.map((u, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{u.nombre}</p>
                  <p className="text-xs text-muted-foreground">{u.tipo}</p>
                  <p className="text-xs text-primary font-semibold mt-1">📍 {u.distancia}</p>
                  <div className="flex gap-2 mt-2">
                    <a href={`tel:${u.telefono}`}
                      className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-semibold">
                      <Phone className="w-3 h-3" /> Llamar
                    </a>
                    <button className="flex items-center gap-1 text-xs bg-muted text-foreground px-3 py-1.5 rounded-xl font-semibold">
                      <Navigation className="w-3 h-3" /> Cómo llegar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Los datos de unidades se actualizan al recuperar conexión. En caso de emergencia, llama al <strong>911</strong>.</p>
          </div>
        </div>
      )}

      {/* Recordatorio */}
      {seleccionados.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-emerald-800 text-sm">¡Sin signos de alarma!</p>
          <p className="text-xs text-emerald-700 mt-1">Marca cualquier síntoma que experimentes para recibir orientación inmediata.</p>
        </div>
      )}
    </div>
  );
}