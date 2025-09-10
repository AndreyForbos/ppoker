import { createClient } from '@supabase/supabase-js'

// O Vite expõe as variáveis de ambiente no objeto especial `import.meta.env`.
// O prefixo VITE_ é necessário para que as variáveis sejam expostas ao cliente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Este erro será exibido se as variáveis de ambiente não estiverem configuradas corretamente.
  // Para desenvolvimento local, crie um arquivo .env na raiz do projeto e adicione as variáveis.
  // Para produção (GitHub Pages), configure os "Repository Secrets" no GitHub.
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser configuradas.')
}

// Isso exporta um cliente Supabase que pode ser usado em todo o aplicativo
export const supabase = createClient(supabaseUrl, supabaseAnonKey)