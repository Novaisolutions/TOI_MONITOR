import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ProspectoTOI } from '../types/database';
import { normalizeEstadoEmbudo } from '../lib/utils';
import { showToast } from '../components/ui/ToastContainer';

// Estado para gestionar qué campos se resaltan temporalmente
type HighlightedFields = Record<number, Set<keyof ProspectoTOI>>;

// Función de normalización para TOI
const normalizeProspectoTOI = (prospecto: ProspectoTOI): ProspectoTOI => {
  return {
    ...prospecto,
    estado_embudo: normalizeEstadoEmbudo(prospecto.estado_embudo),
  };
};

interface UseProspectosTOIOptions {
  userId?: string;
  isAsesor?: boolean;
}

function useProspectosTOI(options: UseProspectosTOIOptions = {}) {
  const { userId, isAsesor } = options;
  const [prospectos, setProspectos] = useState<ProspectoTOI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<HighlightedFields>({});
  const [newProspectosIds, setNewProspectosIds] = useState<Set<number>>(new Set());
  const soundEnabledRef = useRef(true);

  // Función para resaltar un campo y quitar el resaltado después de un tiempo
  const highlightChanges = (prospectoId: number, fields: Set<keyof ProspectoTOI>) => {
    setHighlightedFields(prev => ({ ...prev, [prospectoId]: fields }));
    setTimeout(() => {
      setHighlightedFields(prev => {
        const newHighlights = { ...prev };
        delete newHighlights[prospectoId];
        return newHighlights;
      });
    }, 2500);
  };

  // Función para marcar un prospecto como "nuevo" temporalmente
  const markAsNew = (prospectoId: number) => {
    setNewProspectosIds(prev => new Set([...prev, prospectoId]));
    setTimeout(() => {
      setNewProspectosIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(prospectoId);
        return newSet;
      });
    }, 10000); // Mantener la marca de "nuevo" por 10 segundos
  };

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (soundEnabledRef.current) {
      try {
        // Crear un sonido simple usando la Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.warn('No se pudo reproducir el sonido de notificación', e);
      }
    }
  }, []);

  // Función para obtener todos los prospectos ordenados por último mensaje
  const fetchProspectos = useCallback(async () => {
    console.log('[useProspectosTOI] Fetching prospectos ordenados por último mensaje...');
    console.log('[useProspectosTOI] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('[useProspectosTOI] Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    setLoading(true);
    setError(null);
    
    try {
      // Usar consulta directa a la tabla prospectos_toi
      let query = supabase
        .from('prospectos_toi')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(200);
      
      // Aplicar filtro de asesor DIRECTO en prospectos_toi
      if (isAsesor && userId) {
        console.log('[useProspectosTOI] 🔍 Filtering for asesor:', { userId, isAsesor });
        query = query.eq('assigned_to', userId);
        console.log('[useProspectosTOI] 🎯 Asesor filter applied - User ID:', userId);
      } else {
        console.log('[useProspectosTOI] 👤 Admin or no filter - showing all prospectos');
      }

      const { data, error: fetchError } = await query;
      
      if (data) {
        console.log('[useProspectosTOI] ✅ Fetched prospectos:', data.length);
      }

      if (fetchError) {
        console.error('[useProspectosTOI] Error:', fetchError);
        console.error('[useProspectosTOI] Error details:', JSON.stringify(fetchError, null, 2));
        setError(fetchError.message);
        setProspectos([]);
      } else {
        console.log(`[useProspectosTOI] Successfully fetched ${data?.length ?? 0} prospectos.`);
        console.log('[useProspectosTOI] Raw data sample:', data?.slice(0, 2));
        const normalizedData = (data || []).map(normalizeProspectoTOI);
        setProspectos(normalizedData);
        console.log('[useProspectosTOI] Normalized data sample:', normalizedData.slice(0, 2));
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during fetch:', catchError);
      setError(catchError.message || 'Error desconocido');
      setProspectos([]);
    } finally {
      setLoading(false);
    }
  }, [userId, isAsesor]);

  // Función para crear un nuevo prospecto
  const createProspecto = useCallback(async (prospectoData: Partial<ProspectoTOI>) => {
    console.log('[useProspectosTOI] Creating new prospecto:', prospectoData);
    setError(null);
    
    if (!prospectoData.nombre || !prospectoData.numero_telefono) {
      const errMsg = "El nombre y el número de teléfono son obligatorios para crear un prospecto.";
      console.error(`[useProspectosTOI] ${errMsg}`);
      setError(errMsg);
      return null;
    }

    try {
      const prospectoCompleto = {
        ...prospectoData,
        estado_embudo: prospectoData.estado_embudo || 'lead',
        prioridad: prospectoData.prioridad || 'media',
        sentimiento_conversacion: prospectoData.sentimiento_conversacion || 'neutral',
        score_interes: prospectoData.score_interes || 50,
        probabilidad_conversion: prospectoData.probabilidad_conversion || 30,
        notas_manuales: prospectoData.notas_manuales || [],
        fuente_lead: prospectoData.fuente_lead || 'Manual',
        tipo_operacion: prospectoData.tipo_operacion || 'Compra',
      };

      const { data, error: insertError } = await supabase
        .from('prospectos_toi')
        .insert([prospectoCompleto])
        .select()
        .single();
        
      if (insertError) {
        console.error('[useProspectosTOI] Error creating prospecto:', insertError);
        setError(insertError.message);
        return null;
      } else {
        console.log('[useProspectosTOI] Prospecto created successfully.');
        return data;
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during create:', catchError);
      setError(catchError.message || 'Error desconocido');
      return null;
    }
  }, []);

  // Función unificada para actualizar cualquier campo de un prospecto
  const updateProspecto = useCallback(async (id: number, updates: Partial<ProspectoTOI>) => {
    console.log('[useProspectosTOI] Updating prospecto:', id, updates);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('prospectos_toi')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[useProspectosTOI] Error updating prospecto:', updateError);
        setError(updateError.message);
        return null;
      } else {
        console.log('[useProspectosTOI] Prospecto updated successfully.');
        return data;
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during update:', catchError);
      setError(catchError.message || 'Error desconocido');
      return null;
    }
  }, []);

  // Función para eliminar un prospecto
  const deleteProspecto = useCallback(async (id: number) => {
    console.log('[useProspectosTOI] Deleting prospecto:', id);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('prospectos_toi')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error('[useProspectosTOI] Error deleting prospecto:', deleteError);
        setError(deleteError.message);
        return false;
      } else {
        console.log('[useProspectosTOI] Prospecto deleted successfully.');
        return true;
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during delete:', catchError);
      setError(catchError.message || 'Error desconocido');
      return false;
    }
  }, []);

  // Efecto para cargar datos iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    // 1. Carga inicial de datos
    fetchProspectos();

    // 2. Suscripción a cambios en la tabla 'prospectos_toi'
    const channel = supabase
      .channel('prospectos-TOI-realtime-channel')
      .on<ProspectoTOI>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospectos_toi' },
        (payload) => {
          console.log('[Realtime TOI] ===== CHANGE RECEIVED =====');
          console.log('[Realtime TOI] Event Type:', payload.eventType);
          console.log('[Realtime TOI] Payload:', payload);

          if (payload.eventType === 'INSERT') {
            console.log('[Realtime TOI] Processing INSERT...');
            const newProspecto = normalizeProspectoTOI(payload.new);
            
            // Agregar al estado
            setProspectos(currentProspectos => 
              [newProspecto, ...currentProspectos]
            );
            
            // Resaltar campos
            highlightChanges(newProspecto.id, new Set(['nombre', 'estado_embudo']));
            
            // Marcar como nuevo
            markAsNew(newProspecto.id);
            
            // Mostrar notificación toast
            showToast({
              type: 'success',
              title: '🎉 ¡Nuevo Prospecto!',
              message: `${newProspecto.nombre || 'Prospecto sin nombre'} ha sido agregado`,
              duration: 5000,
            });
            
            // Reproducir sonido
            playNotificationSound();
            
            console.log('[Realtime TOI] INSERT processed');
          }

          if (payload.eventType === 'UPDATE') {
            console.log('[Realtime TOI] Processing UPDATE...');
            const updatedProspecto = normalizeProspectoTOI(payload.new);
            const oldProspecto = payload.old;
            
            console.log('[Realtime TOI] Old prospecto:', oldProspecto);
            console.log('[Realtime TOI] New prospecto:', updatedProspecto);
            
            const changedFields = new Set<keyof ProspectoTOI>();
            Object.keys(updatedProspecto).forEach(key => {
              const typedKey = key as keyof ProspectoTOI;
              if (JSON.stringify(updatedProspecto[typedKey]) !== JSON.stringify(oldProspecto[typedKey])) {
                changedFields.add(typedKey);
              }
            });

            console.log('[Realtime TOI] Changed fields:', Array.from(changedFields));
            
            if (changedFields.has('historial_estados')) {
              console.log('[Realtime TOI] 🎯 HISTORIAL_ESTADOS CHANGED!');
              console.log('[Realtime TOI] Old historial:', oldProspecto.historial_estados);
              console.log('[Realtime TOI] New historial:', updatedProspecto.historial_estados);
            }

            // 🚨 CRÍTICO: Detectar reasignación de asesor
            if (changedFields.has('assigned_to')) {
              console.log('[Realtime TOI] 🔄 REASIGNACIÓN DETECTADA!');
              console.log('[Realtime TOI] Old asesor:', oldProspecto.assigned_to);
              console.log('[Realtime TOI] New asesor:', updatedProspecto.assigned_to);
              console.log('[Realtime TOI] Current userId:', userId);
              console.log('[Realtime TOI] Is asesor:', isAsesor);
              
              // Si NO es asesor (es admin), aplicar update normal
              if (!isAsesor) {
                console.log('[Realtime TOI] 👤 Es admin, aplicar update normal');
                // No hacer return, dejar que continúe con el update normal
              } else {
                // Es asesor: Aplicar filtro estricto
                console.log('[Realtime TOI] 🎯 Es asesor, aplicar filtro estricto');
                
                const prospectoEstaEnMiVista = currentProspectos => 
                  currentProspectos.some(p => p.id === updatedProspecto.id);
                
                // CASO 1: Prospecto YA ESTÁ en mi vista Y ya NO me pertenece → ELIMINAR
                if (updatedProspecto.assigned_to !== userId) {
                  console.log('[Realtime TOI] ❌ Prospecto ya NO me pertenece, verificando si está en mi vista...');
                  
                  setProspectos(currentProspectos => {
                    const exists = prospectoEstaEnMiVista(currentProspectos);
                    
                    if (exists) {
                      console.log('[Realtime TOI] ❌ Prospecto estaba en mi vista, REMOVIENDO');
                      showToast({
                        type: 'warning',
                        title: '⚠️ Prospecto Reasignado',
                        message: `${updatedProspecto.nombre || 'Un prospecto'} fue reasignado a otro asesor`,
                        duration: 5000,
                      });
                      playNotificationSound();
                      
                      return currentProspectos.filter(p => p.id !== updatedProspecto.id);
                    } else {
                      console.log('[Realtime TOI] ℹ️ Prospecto no estaba en mi vista, ignorando');
                      return currentProspectos;
                    }
                  });
                  
                  return; // No continuar con el update normal
                }
                
                // CASO 2: Prospecto AHORA me pertenece Y NO está en mi vista → AGREGAR
                if (updatedProspecto.assigned_to === userId) {
                  console.log('[Realtime TOI] ✅ Prospecto AHORA me pertenece, verificando si está en mi vista...');
                  
                  setProspectos(currentProspectos => {
                    const exists = prospectoEstaEnMiVista(currentProspectos);
                    
                    if (!exists) {
                      console.log('[Realtime TOI] ✅ Prospecto NO estaba en mi vista, AGREGANDO');
                      showToast({
                        type: 'success',
                        title: '🎉 ¡Nuevo Prospecto Asignado!',
                        message: `${updatedProspecto.nombre || 'Un prospecto'} te fue asignado`,
                        duration: 5000,
                      });
                      playNotificationSound();
                      
                      return [updatedProspecto, ...currentProspectos];
                    } else {
                      console.log('[Realtime TOI] ℹ️ Prospecto YA estaba en mi vista, aplicar update normal');
                      return currentProspectos.map(p => (p.id === updatedProspecto.id ? updatedProspecto : p));
                    }
                  });
                  
                  return; // No continuar con el update normal
                }
              }
            }

            setProspectos(currentProspectos => {
              const updated = currentProspectos.map(p => (p.id === updatedProspecto.id ? updatedProspecto : p));
              console.log('[Realtime TOI] Updated prospectos in state');
              return updated;
            });
            
            if (changedFields.size > 0) {
              highlightChanges(updatedProspecto.id, changedFields);
              
              // Mostrar notificación solo para cambios importantes
              if (changedFields.has('estado_embudo') || changedFields.has('resumen_ia')) {
                showToast({
                  type: 'info',
                  title: '📝 Prospecto Actualizado',
                  message: `${updatedProspecto.nombre || 'Prospecto'} ha sido actualizado`,
                  duration: 3000,
                });
                playNotificationSound();
              }
            }
            console.log('[Realtime TOI] UPDATE processed');
          }

          if (payload.eventType === 'DELETE') {
            const deletedProspectoId = payload.old.id;
            setProspectos(currentProspectos =>
              currentProspectos.filter(p => p.id !== deletedProspectoId)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime TOI] Successfully subscribed to prospectos_toi changes!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime TOI] Subscription failed.');
          setError('Error de conexión en tiempo real.');
        }
      });

    // 3. Función de limpieza
    return () => {
      console.log('[Realtime TOI] Unsubscribing from channel.');
      supabase.removeChannel(channel);
    };
  }, [fetchProspectos]);

  // Función para actualizar el historial de estados
  const updateEstadoWithHistory = useCallback(async (id: number, nuevoEstado: string, motivo?: string, usuario?: string) => {
    console.log('[useProspectosTOI] Updating estado with history:', id, nuevoEstado);
    setError(null);
    
    try {
      // Primero obtener el prospecto actual para saber el estado anterior
      const { data: prospectoActual, error: fetchError } = await supabase
        .from('prospectos_toi')
        .select('estado_embudo, historial_estados')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('[useProspectosTOI] Error fetching current prospecto:', fetchError);
        setError(fetchError.message);
        return null;
      }

      const estadoAnterior = prospectoActual.estado_embudo;
      const historialActual = prospectoActual.historial_estados || [];
      
      // Solo agregar al historial si el estado realmente cambió
      let nuevoHistorial = historialActual;
      if (estadoAnterior !== nuevoEstado) {
        const nuevoEntrada = {
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstado,
          fecha: new Date().toISOString(),
          motivo: motivo || undefined,
          usuario: usuario || 'Sistema'
        };
        
        nuevoHistorial = [...historialActual, nuevoEntrada];
      }

      // Actualizar el prospecto con el nuevo estado e historial
      const { data, error: updateError } = await supabase
        .from('prospectos_toi')
        .update({
          estado_embudo: nuevoEstado,
          historial_estados: nuevoHistorial,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[useProspectosTOI] Error updating prospecto:', updateError);
        setError(updateError.message);
        return null;
      } else {
        console.log('[useProspectosTOI] Prospecto estado updated successfully with history.');
        
        // Actualizar el estado local inmediatamente
        setProspectos(currentProspectos => 
          currentProspectos.map(p => 
            p.id === id ? { 
              ...p, 
              estado_embudo: nuevoEstado, 
              historial_estados: nuevoHistorial,
              updated_at: data.updated_at 
            } : p
          )
        );
        
        return data;
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during estado update:', catchError);
      setError(catchError.message || 'Error desconocido');
      return null;
    }
  }, []);

  // Función para actualizar estado_embudo con tracking automático
  const updateEstadoEmbudoWithHistory = useCallback(async (id: number, nuevoEstadoEmbudo: string, usuario?: string) => {
    console.log('[updateEstadoEmbudoWithHistory] ===== INICIO =====');
    console.log('[updateEstadoEmbudoWithHistory] ID:', id);
    console.log('[updateEstadoEmbudoWithHistory] Nuevo estado:', nuevoEstadoEmbudo);
    console.log('[updateEstadoEmbudoWithHistory] Usuario:', usuario);
    setError(null);
    
    try {
      // Primero obtener el prospecto actual para saber el estado anterior y el resumen actual
      console.log('[updateEstadoEmbudoWithHistory] Fetching current prospecto...');
      const { data: prospectoActual, error: fetchError } = await supabase
        .from('prospectos_toi')
        .select('estado_embudo, historial_estados, resumen_ia')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('[updateEstadoEmbudoWithHistory] Error fetching current prospecto:', fetchError);
        setError(fetchError.message);
        return null;
      }

      console.log('[updateEstadoEmbudoWithHistory] Prospecto actual:', prospectoActual);

      const estadoAnterior = prospectoActual.estado_embudo;
      const historialActual = prospectoActual.historial_estados || [];
      const resumenActual = prospectoActual.resumen_ia;
      
      console.log('[updateEstadoEmbudoWithHistory] Estado anterior:', estadoAnterior);
      console.log('[updateEstadoEmbudoWithHistory] Historial actual:', historialActual);
      console.log('[updateEstadoEmbudoWithHistory] Resumen actual:', resumenActual);
      
      // Solo agregar al historial si el estado realmente cambió
      let nuevoHistorial = historialActual;
      if (estadoAnterior !== nuevoEstadoEmbudo) {
        console.log('[updateEstadoEmbudoWithHistory] Estado cambió! Creando nueva entrada...');
        const nuevoEntrada = {
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstadoEmbudo,
          fecha: new Date().toISOString(),
          motivo: `Cambio de estado de embudo: ${estadoAnterior} → ${nuevoEstadoEmbudo}`,
          usuario: usuario || 'Sistema',
          resumen_momento: resumenActual || 'Sin resumen disponible'
        };
        
        console.log('[updateEstadoEmbudoWithHistory] Nueva entrada:', nuevoEntrada);
        nuevoHistorial = [...historialActual, nuevoEntrada];
        console.log('[updateEstadoEmbudoWithHistory] Nuevo historial:', nuevoHistorial);
      } else {
        console.log('[updateEstadoEmbudoWithHistory] Estado no cambió, no se agregará al historial');
      }

      // Actualizar el prospecto con el nuevo estado e historial
      console.log('[updateEstadoEmbudoWithHistory] Actualizando en base de datos...');
      const { data, error: updateError } = await supabase
        .from('prospectos_toi')
        .update({
          estado_embudo: nuevoEstadoEmbudo,
          historial_estados: nuevoHistorial,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[updateEstadoEmbudoWithHistory] Error updating prospecto estado_embudo:', updateError);
        console.error('[updateEstadoEmbudoWithHistory] Error details:', updateError);
        setError(updateError.message);
        return null;
      } else {
        console.log('[updateEstadoEmbudoWithHistory] ✅ UPDATE SUCCESS!');
        console.log('[updateEstadoEmbudoWithHistory] Data returned:', data);
        
        // Actualizar el estado local inmediatamente (optimistic update)
        console.log('[updateEstadoEmbudoWithHistory] Updating local state...');
        setProspectos(currentProspectos => 
          currentProspectos.map(p => 
            p.id === id ? { 
              ...p, 
              estado_embudo: nuevoEstadoEmbudo, 
              historial_estados: nuevoHistorial,
              updated_at: data.updated_at 
            } : p
          )
        );
        
        console.log('[updateEstadoEmbudoWithHistory] ===== COMPLETED SUCCESSFULLY =====');
        return data;
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during estado_embudo update:', catchError);
      setError(catchError.message || 'Error desconocido');
      return null;
    }
  }, []);

  // Función para agregar un comentario manual
  const agregarComentario = useCallback(async (id: number, comentario: { content: string; author: string }) => {
    console.log('[useProspectosTOI] Adding comment:', id, comentario);
    setError(null);
    
    try {
      // Obtener las notas actuales
      const { data: prospectoActual, error: fetchError } = await supabase
        .from('prospectos_toi')
        .select('notas_manuales')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('[useProspectosTOI] Error fetching current prospecto:', fetchError);
        setError(fetchError.message);
        return null;
      }

      const notasActuales = prospectoActual.notas_manuales || [];
      
      const nuevoComentario = {
        content: comentario.content,
        timestamp: new Date().toISOString(),
        author: comentario.author
      };
      
      const nuevasNotas = [...notasActuales, nuevoComentario];

      // Actualizar el prospecto con el nuevo comentario
      const { data, error: updateError } = await supabase
        .from('prospectos_toi')
        .update({
          notas_manuales: nuevasNotas,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[useProspectosTOI] Error updating prospecto:', updateError);
        setError(updateError.message);
        return null;
      } else {
        console.log('[useProspectosTOI] Comment added successfully.');
        
        // Actualizar el estado local inmediatamente
        setProspectos(currentProspectos => 
          currentProspectos.map(p => 
            p.id === id ? { ...p, notas_manuales: nuevasNotas, updated_at: data.updated_at } : p
          )
        );
        
        return data;
      }
    } catch (catchError: any) {
      console.error('[useProspectosTOI] Exception during comment add:', catchError);
      setError(catchError.message || 'Error desconocido');
      return null;
    }
  }, []);

  // Cargar prospectos cuando cambie el usuario o su rol
  useEffect(() => {
    console.log('[useProspectosTOI] 🔄 Loading prospectos (user/role changed)...', { userId, isAsesor });
    fetchProspectos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAsesor]);

  return {
    prospectos,
    loading,
    error,
    highlightedFields,
    newProspectosIds,
    fetchProspectos,
    createProspecto,
    updateProspecto,
    deleteProspecto,
    updateEstadoWithHistory,
    updateEstadoEmbudoWithHistory,
    agregarComentario,
    clearError: () => setError(null)
  };
}

export default useProspectosTOI;
