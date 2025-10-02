import { useState, useCallback, useRef, useEffect } from 'react';

type ResizerType = 'left-middle' | 'middle-right';

interface ColumnWidths {
  leftPanel: number;
  middlePanel: number;
  rightPanel: number;
}

const DEFAULT_WIDTHS: ColumnWidths = {
  leftPanel: 280,
  middlePanel: 400,
  rightPanel: 900 // Columna derecha más ancha por defecto, se pegará al borde
};

const MIN_WIDTH = 250;
const MAX_MIDDLE_PANEL_PERCENTAGE = 0.5; // Máximo 50% del ancho total
const MIN_RIGHT_PANEL_WIDTH = 400; // Mínimo ancho para columna derecha

export const useResizableColumns = () => {
  const [widths, setWidths] = useState<ColumnWidths>(() => {
    const saved = localStorage.getItem('prospectos-column-widths');
    return saved ? JSON.parse(saved) : DEFAULT_WIDTHS;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [activeResizer, setActiveResizer] = useState<ResizerType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthsRef = useRef<ColumnWidths>(widths);

  // Guardar en localStorage cuando cambian los anchos
  useEffect(() => {
    localStorage.setItem('prospectos-column-widths', JSON.stringify(widths));
  }, [widths]);

  const handleMouseDown = useCallback((resizer: ResizerType, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setActiveResizer(resizer);
    startXRef.current = e.clientX;
    startWidthsRef.current = widths;
  }, [widths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !activeResizer || !containerRef.current) return;

    const delta = e.clientX - startXRef.current;
    const newWidths = { ...startWidthsRef.current };
    const containerWidth = containerRef.current.offsetWidth;
    const maxMiddleWidth = containerWidth * MAX_MIDDLE_PANEL_PERCENTAGE;

    if (activeResizer === 'left-middle') {
      // Ajustar panel izquierdo y medio
      let newLeftWidth = Math.max(MIN_WIDTH, startWidthsRef.current.leftPanel + delta);
      let newMiddleWidth = Math.max(MIN_WIDTH, startWidthsRef.current.middlePanel - delta);
      
      // Aplicar límite del 50% a la columna del medio
      if (newMiddleWidth > maxMiddleWidth) {
        newMiddleWidth = maxMiddleWidth;
        newLeftWidth = startWidthsRef.current.leftPanel + (startWidthsRef.current.middlePanel - maxMiddleWidth);
      }
      
      newWidths.leftPanel = newLeftWidth;
      newWidths.middlePanel = newMiddleWidth;
    } else if (activeResizer === 'middle-right') {
      // Ajustar panel medio y derecho
      let newMiddleWidth = Math.max(MIN_WIDTH, startWidthsRef.current.middlePanel + delta);
      let newRightWidth = Math.max(MIN_RIGHT_PANEL_WIDTH, startWidthsRef.current.rightPanel - delta);
      
      // Aplicar límite del 50% a la columna del medio
      if (newMiddleWidth > maxMiddleWidth) {
        newMiddleWidth = maxMiddleWidth;
        newRightWidth = startWidthsRef.current.rightPanel - (maxMiddleWidth - startWidthsRef.current.middlePanel);
      }
      
      // Asegurar que la columna derecha no sea menor al mínimo
      if (newRightWidth < MIN_RIGHT_PANEL_WIDTH) {
        newRightWidth = MIN_RIGHT_PANEL_WIDTH;
        newMiddleWidth = startWidthsRef.current.middlePanel + (startWidthsRef.current.rightPanel - MIN_RIGHT_PANEL_WIDTH);
      }
      
      newWidths.middlePanel = newMiddleWidth;
      newWidths.rightPanel = newRightWidth;
    }

    setWidths(newWidths);
  }, [isResizing, activeResizer]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setActiveResizer(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const getPercentageWidths = useCallback(() => {
    if (!containerRef.current) return widths;
    
    const containerWidth = containerRef.current.offsetWidth;
    const totalWidth = widths.leftPanel + widths.middlePanel + widths.rightPanel;
    const scale = containerWidth / totalWidth;

    return {
      leftPanel: `${(widths.leftPanel * scale)}px`,
      middlePanel: `${(widths.middlePanel * scale)}px`,
      rightPanel: `${(widths.rightPanel * scale)}px`
    };
  }, [widths]);

  const resetWidths = useCallback(() => {
    setWidths(DEFAULT_WIDTHS);
    localStorage.removeItem('prospectos-column-widths');
  }, []);

  return {
    widths,
    isResizing,
    activeResizer,
    containerRef,
    getPercentageWidths,
    handleMouseDown,
    resetWidths
  };
};
