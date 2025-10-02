import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ConversationsStats {
  totalThisMonth: number;
  totalAll: number;
  loading: boolean;
}

export default function useConversationsStats() {
  const [stats, setStats] = useState<ConversationsStats>({
    totalThisMonth: 0,
    totalAll: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

        console.log('🔍 [useConversationsStats] Fetching stats...', {
          currentDate: currentDate.toISOString(),
          firstDayOfMonth: firstDayOfMonth.toISOString(),
          firstDayOfNextMonth: firstDayOfNextMonth.toISOString()
        });

        // Obtener mensajes del mes actual
        const { data: monthlyMessages, error: monthlyError } = await supabase
          .from('mensajes_toi')
          .select('conversation_id')
          .gte('fecha', firstDayOfMonth.toISOString())
          .lt('fecha', firstDayOfNextMonth.toISOString());

        if (monthlyError) {
          console.error('❌ [useConversationsStats] Error fetching monthly messages:', monthlyError);
          setStats(prev => ({ ...prev, loading: false }));
          return;
        }

        console.log('📊 [useConversationsStats] Monthly messages:', monthlyMessages);

        // Contar conversaciones únicas
        const uniqueConversations = new Set(monthlyMessages?.map(msg => msg.conversation_id) || []);
        
        // Obtener total de todas las conversaciones
        const { count: totalCount, error: totalError } = await supabase
          .from('conversaciones_toi')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.error('❌ [useConversationsStats] Error fetching total count:', totalError);
        }

        const newStats = {
          totalThisMonth: uniqueConversations.size,
          totalAll: totalCount || 0,
          loading: false
        };

        console.log('✅ [useConversationsStats] Final stats:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('❌ [useConversationsStats] Error in fetchStats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}
