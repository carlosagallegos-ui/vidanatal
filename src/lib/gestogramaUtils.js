import { differenceInDays, addDays, format } from 'date-fns';

export function calcularEdadGestacional(fum) {
  if (!fum) return null;
  const hoy = new Date();
  const inicio = new Date(fum);
  const dias = differenceInDays(hoy, inicio);
  return {
    semanas: Math.floor(dias / 7),
    dias: dias % 7,
    totalDias: dias,
  };
}

export function calcularFPP(fum) {
  if (!fum) return null;
  const inicio = new Date(fum);
  return addDays(inicio, 280);
}

export function calcularIMC(peso, tallaCm) {
  if (!peso || !tallaCm) return null;
  const tallaM = tallaCm / 100;
  return (peso / (tallaM * tallaM)).toFixed(1);
}

export function calcularGananciaPesoRecomendada(imcPregestacional) {
  if (!imcPregestacional) return { min: 11.5, max: 16 };
  if (imcPregestacional < 18.5) return { min: 12.5, max: 18 };
  if (imcPregestacional < 25) return { min: 11.5, max: 16 };
  if (imcPregestacional < 30) return { min: 7, max: 11.5 };
  return { min: 5, max: 9 };
}

export function evaluarRiesgoObstetrico(perfil, consultas) {
  let puntaje = 0;
  const factores = [];

  if (perfil.cesareas_previas > 0) { puntaje += 2; factores.push('Cesárea previa'); }
  if (perfil.abortos_previos >= 2) { puntaje += 2; factores.push('Abortos de repetición'); }
  if (perfil.rh === 'negativo') { puntaje += 1; factores.push('Rh negativo'); }
  if (perfil.enfermedades_previas) { puntaje += 1; factores.push('Antecedentes patológicos'); }

  const ultimaConsulta = consultas?.[0];
  if (ultimaConsulta) {
    if (ultimaConsulta.presion_sistolica >= 140 || ultimaConsulta.presion_diastolica >= 90) {
      puntaje += 3; factores.push('Hipertensión arterial');
    }
    if (ultimaConsulta.edema === 'moderado' || ultimaConsulta.edema === 'severo') {
      puntaje += 2; factores.push('Edema significativo');
    }
  }

  let nivel = 'bajo';
  if (puntaje >= 3 && puntaje < 6) nivel = 'medio';
  if (puntaje >= 6) nivel = 'alto';

  return { nivel, puntaje, factores };
}

export const HITOS_FETALES = [
  { semana: 4, titulo: 'Implantación', descripcion: 'El embrión se implanta en el útero. El corazón comienza a formarse.' },
  { semana: 6, titulo: 'Latido cardiaco', descripcion: 'Se puede detectar el latido del corazón por ultrasonido.' },
  { semana: 8, titulo: 'Formación de órganos', descripcion: 'Todos los órganos principales están en formación. Mide ~1.6 cm.' },
  { semana: 12, titulo: 'Fin del primer trimestre', descripcion: 'El bebé tiene todos sus órganos formados. Mide ~6 cm. Los dedos están diferenciados.' },
  { semana: 16, titulo: 'Movimientos', descripcion: 'El bebé puede hacer movimientos faciales y mover los miembros. Mide ~12 cm.' },
  { semana: 20, titulo: 'Mitad del embarazo', descripcion: 'Ultrasonido morfológico. Se pueden identificar características del bebé. Mide ~16 cm.' },
  { semana: 24, titulo: 'Viabilidad', descripcion: 'El bebé alcanza la viabilidad. Los pulmones comienzan a madurar. Mide ~21 cm.' },
  { semana: 28, titulo: 'Tercer trimestre', descripcion: 'El bebé abre y cierra los ojos. Duerme y se despierta. Mide ~25 cm.' },
  { semana: 32, titulo: 'Práctica de respiración', descripcion: 'El bebé practica movimientos respiratorios. Los huesos están completamente formados.' },
  { semana: 36, titulo: 'Casi a término', descripcion: 'El bebé está en posición para el parto. Gana peso rápidamente. Mide ~45 cm.' },
  { semana: 40, titulo: 'Término del embarazo', descripcion: '¡El bebé está listo! Mide aproximadamente 50 cm y pesa entre 3 y 3.5 kg.' },
];

export const ACCIONES_PRENATALES = [
  { semana_inicio: 1, semana_fin: 12, tipo: 'consulta', titulo: '1ª Consulta Prenatal', descripcion: 'Historia clínica completa, laboratorios iniciales, ultrasonido 1er trimestre' },
  { semana_inicio: 11, semana_fin: 14, tipo: 'estudio', titulo: 'Ultrasonido 1er Trimestre', descripcion: 'Medición de translucencia nucal, detección de anomalías' },
  { semana_inicio: 14, semana_fin: 20, tipo: 'consulta', titulo: '2ª Consulta Prenatal', descripcion: 'Evaluación de resultados, consejería nutricional' },
  { semana_inicio: 18, semana_fin: 22, tipo: 'estudio', titulo: 'Ultrasonido Morfológico', descripcion: 'Estudio detallado de anatomía fetal' },
  { semana_inicio: 24, semana_fin: 28, tipo: 'laboratorio', titulo: 'Curva de Tolerancia a Glucosa', descripcion: 'Detección de diabetes gestacional' },
  { semana_inicio: 28, semana_fin: 30, tipo: 'consulta', titulo: '4ª Consulta Prenatal', descripcion: 'Evaluación de crecimiento fetal, Rho-GAM si aplica' },
  { semana_inicio: 32, semana_fin: 34, tipo: 'consulta', titulo: '5ª Consulta Prenatal', descripcion: 'Evaluación de bienestar fetal' },
  { semana_inicio: 35, semana_fin: 37, tipo: 'laboratorio', titulo: 'Cultivo Estreptococo Grupo B', descripcion: 'Tamizaje para prevenir infección neonatal' },
  { semana_inicio: 36, semana_fin: 38, tipo: 'consulta', titulo: '6ª Consulta Prenatal', descripcion: 'Evaluación de presentación fetal, plan de parto' },
  { semana_inicio: 38, semana_fin: 42, tipo: 'consulta', titulo: '7ª+ Consulta Prenatal', descripcion: 'Monitoreo semanal hasta el parto' },
];