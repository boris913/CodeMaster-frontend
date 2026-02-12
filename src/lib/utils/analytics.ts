// Fonctions d'analyse pour les graphiques
export function calculateGrowth(data: number[]): number {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    if (first === 0) return last > 0 ? 100 : 0;
    return ((last - first) / first) * 100;
  }
  
  export function formatDurationMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  }