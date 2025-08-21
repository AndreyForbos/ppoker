import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Este código lida com o redirecionamento do 404.html no GitHub Pages.
const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect');

if (redirect) {
  // Obtém o nome do repositório do pathname da URL atual.
  const repoName = window.location.pathname.split('/')[1];
  // Constrói o caminho completo e correto, incluindo o nome do repositório.
  const newPath = `/${repoName}${redirect}`;
  // Usa history.replaceState para atualizar a URL na barra de endereço do navegador sem recarregar a página.
  // Isso faz com que a URL pareça correta para o usuário e permite que o React Router funcione adequadamente.
  window.history.replaceState(null, '', newPath);
}

createRoot(document.getElementById("root")!).render(<App />);