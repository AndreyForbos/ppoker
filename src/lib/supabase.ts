import { createClient } from '@supabase/supabase-js'

// O Vite expõe as variáveis de ambiente no objeto especial `import.meta.env`.
// O prefixo VITE_ é necessário para que as variáveis sejam expostas ao cliente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Para o ambiente de preview, podemos usar os valores fixos se as variáveis de ambiente não estiverem definidas.
// Em um ambiente de produção real (como o configurado com o GitHub Actions),
// o build falharia se essas variáveis não estivessem presentes.
const finalUrl = supabaseUrl || 'https://utqbgetlcsnzlkxelvrc.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cWJnZXRsY3NuemxreGVsdnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mzg3ODIsImV4cCI6MjA3MTExNDc4Mn0.sniUKgX7XBhY0BVcRhvPIT5CgGTdb83iQGRQsPfrFm8';

if (!finalUrl || !finalKey) {
  // Este erro será exibido se as variáveis de ambiente não estiverem configuradas corretamente
  // e não houver valores de fallback.
  throw new Error('A URL e a Chave Anônima do Supabase devem ser fornecidas.')
}

// Isso exporta um cliente Supabase que pode ser usado em todo o aplicativo
export const supabase = createClient(finalUrl, finalKey)