// src/components/ui/VirtualizedSelectContent.tsx

import React from 'react';
import { FixedSizeList } from 'react-window';
import { SelectContent, SelectItem } from "@/components/ui/select"; // Removido SelectViewport
import { Input } from "@/components/ui/input"; // Importado Input
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react"; // Importa todos os ícones para renderização

interface VirtualizedSelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectContent> {
  itemCount: number;
  itemSize: number;
  height: number;
  onValueChange: (value: string) => void; // Renomeado de onSelect para onValueChange
  availableIcons: string[];
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

const CustomVirtualizedSelectContent = React.forwardRef<
  HTMLDivElement,
  VirtualizedSelectContentProps
>(
  ({ className, itemCount, itemSize, height, onValueChange, availableIcons, searchTerm, onSearchChange, ...props }, forwardedRef) => {

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const iconName = availableIcons[index];
      const IconComponent = (LucideIcons as any)[iconName];

      return (
        // Renderiza SelectItem e passa as propriedades corretamente
        // Passamos onClick e onMouseDown para SelectItem para garantir que a seleção funcione
        // e para evitar que o popover feche imediatamente.
        <SelectItem
          key={iconName}
          value={iconName}
          style={style} // Importante para posicionamento da virtualização
          className="flex items-center gap-2 cursor-pointer" // Adicionado cursor-pointer
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault(); // Impede o SelectContent de fechar o popover imediatamente
          }}
          onClick={(e) => { // Quando o SelectItem é clicado, dispara a seleção
            e.stopPropagation(); // Evita propagar para o SelectContent pai
            onValueChange(iconName);
          }}
        >
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span>{iconName}</span>
        </SelectItem>
      );
    };

    return (
      // Envolve tudo no SelectContent
      <SelectContent ref={forwardedRef} className={cn("overflow-hidden p-0", className)} {...props}>
        {/* Campo de busca no topo da lista, sticky */}
        <div className="p-2 sticky top-0 bg-popover z-10 border-b">
          <Input
            placeholder="Buscar ícone..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)} // Tipado o evento
            className="mb-0"
          />
        </div>
        {itemCount === 0 ? (
          <div className="p-4 text-center text-text-secondary">Nenhum ícone encontrado.</div>
        ) : (
          // FixedSizeList agora é o principal elemento de rolagem
          <FixedSizeList
            height={height}
            itemCount={itemCount}
            itemSize={itemSize}
            width="100%"
            overscanCount={5}
            // Não passamos 'outerRef' para os componentes internos do Select Content.
            // O FixedSizeList gerencia sua própria rolagem.
            // Se houver problemas de rolagem, pode ser necessário um `ref` no SelectContent e ajustá-lo.
          >
            {Row}
          </FixedSizeList>
        )}
      </SelectContent>
    );
  }
);

CustomVirtualizedSelectContent.displayName = "CustomVirtualizedSelectContent";

export { CustomVirtualizedSelectContent };