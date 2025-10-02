/**
 * Calcula las iniciales (máximo 2) y un color de fondo pseudo-aleatorio basado en un nombre.
 * @param name - El nombre o identificador para generar las iniciales y el color.
 * @returns Un objeto con las iniciales y el color de fondo hexadecimal.
 */
export const getProfileProps = (name: string | undefined | null): { initials: string, bgColor: string } => {
  const safeName = name || '??'; // Fallback para undefined o null

  // Obtener iniciales (máximo 2)
  const nameParts = safeName.split(/\s+/); // Dividir por espacios
  let initials = '';
  if (nameParts.length === 1) {
    initials = safeName.substring(0, 2).toUpperCase(); // Dos primeras letras si solo hay una palabra
  } else {
    initials = nameParts.map(part => part[0]).join('').substring(0, 2).toUpperCase(); // Primera letra de las dos primeras palabras
  }
  if (!initials) {
      initials = '??'; // Fallback final si todo falla
  }

  // Se devuelve siempre un color azul sólido para unificar la UI.
  const solidBlueColor = '#2563EB'; // Azul de Tailwind (blue-600)

  return { initials, bgColor: solidBlueColor };
}; 