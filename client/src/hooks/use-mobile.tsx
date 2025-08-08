import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // CORRIGIDO: Inicializa isMobile com o valor real imediatamente.
  // Isso evita o estado `undefined` inicial e garante que `isMobile` é sempre um boolean.
  // `typeof window !== "undefined"` é para compatibilidade com Server-Side Rendering (SSR).
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false; // Valor padrão para SSR, pois window não existe no servidor
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // Media Query List para observar mudanças no tamanho da tela.
    // Usamos MOBILE_BREAKPOINT - 1 para que 'mobile' seja < 768px, ou seja, até 767px.
    const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`); // << Opcional: nome da variável mais descritivo

    // Callback para atualizar o estado quando o tamanho da tela muda.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Adiciona o listener para mudanças na media query.
    mediaQueryList.addEventListener("change", onChange);

    // Limpeza: remove o listener quando o componente é desmontado.
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  // Retorna o valor booleano de isMobile. O '!!' garante que seja um boolean puro.
  return isMobile; // << CORRIGIDO: Removido '!!' pois o useState já inicializa como boolean
}