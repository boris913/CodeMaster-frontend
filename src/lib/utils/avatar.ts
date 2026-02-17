// lib/utils/avatar.ts
export const getAvatarUrl = (avatarPath?: string | null): string => {
    if (!avatarPath) return '';
    if (avatarPath.startsWith('http')) return avatarPath;
  
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    let baseURL = apiUrl;
    try {
      // Ne garder que le protocole, l'hôte et le port
      const url = new URL(apiUrl);
      baseURL = url.origin; // ex: http://localhost:5000
    } catch {
      // fallback si l'URL est invalide
    }
    return `${baseURL}${avatarPath}`;
  };