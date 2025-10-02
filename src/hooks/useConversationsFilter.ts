import { useState, useMemo } from 'react';
import { ConversacionTOI } from '../types/database';
import { supabase } from '../lib/supabase';

interface UseConversationsFilterProps {
  conversations: ConversacionTOI[];
}

interface Advisor {
  id: string;
  name: string;
  email: string;
}

export const useConversationsFilter = ({ conversations }: UseConversationsFilterProps) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [advisorConversations, setAdvisorConversations] = useState<Map<string, ConversacionTOI[]>>(new Map());

  // Lista de asesores reales (SOLO José y David)
  const advisors: Advisor[] = [
    { id: '365cbbef-1242-40f5-b589-865d742e2247', name: 'José Manuel', email: 'jose.manuel@toi.com.mx' },
    { id: '58fe7c0b-0153-4fd8-adcb-8e40e02fce10', name: 'David Sandoval', email: 'david.sandoval@toi.com.mx' }
  ];

  // Función para obtener conversaciones por asesor
  const getConversationsByAdvisor = async (advisorId: string) => {
    try {
      const { data, error } = await supabase
        .from('leads_toi')
        .select(`
          numero_telefono,
          assigned_to,
          usuarios_toi!leads_toi_assigned_to_fkey (
            id,
            nombre,
            email
          )
        `)
        .eq('assigned_to', advisorId);

      if (error) {
        console.error('Error fetching leads by advisor:', error);
        return [];
      }

      const leadNumbers = data?.map(lead => lead.numero_telefono) || [];
      
      const filteredConversations = conversations.filter(conv => 
        leadNumbers.includes(conv.numero)
      );

      return filteredConversations;
    } catch (error) {
      console.error('Error in getConversationsByAdvisor:', error);
      return [];
    }
  };

  // Cargar conversaciones por asesor cuando cambie la selección
  const loadAdvisorConversations = async (advisorId: string) => {
    if (advisorConversations.has(advisorId)) {
      return advisorConversations.get(advisorId) || [];
    }

    const advisorConvs = await getConversationsByAdvisor(advisorId);
    setAdvisorConversations(prev => new Map(prev).set(advisorId, advisorConvs));
    return advisorConvs;
  };

  // Conversaciones filtradas
  const filteredConversations = useMemo(() => {
    if (!selectedAdvisor) {
      return conversations;
    }

    return advisorConversations.get(selectedAdvisor) || [];
  }, [selectedAdvisor, advisorConversations, conversations]);

  // Función para cambiar asesor seleccionado
  const handleAdvisorChange = async (advisorId: string | null) => {
    setSelectedAdvisor(advisorId);
    
    if (advisorId) {
      await loadAdvisorConversations(advisorId);
    }
  };

  // Estadísticas por asesor
  const advisorStats = useMemo(() => {
    const stats = new Map<string, { total: number; unread: number }>();
    
    advisors.forEach(advisor => {
      const advisorConvs = advisorConversations.get(advisor.id) || [];
      const total = advisorConvs.length;
      const unread = advisorConvs.filter(conv => conv.tiene_no_leidos).length;
      
      stats.set(advisor.id, { total, unread });
    });

    return stats;
  }, [advisorConversations, advisors]);

  return {
    selectedAdvisor,
    advisors,
    filteredConversations,
    advisorStats,
    handleAdvisorChange,
    loadAdvisorConversations
  };
};
