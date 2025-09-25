// ... (código existente mantido)

// Adicionar esta importação no topo
import { useSelectionManager } from '@/hooks/useSelectionManager';

// Dentro do componente EditorBlock, substituir o estado local por:
const { saveSelection } = useSelectionManager();

// E modificar o commonProps para:
const commonProps = {
  onMouseUp: () => {
    saveSelection();
    calculateToolbarPosition();
  },
  onKeyUp: () => {
    saveSelection();
    calculateToolbarPosition();
  },
  onFocus: () => {
    saveSelection();
    calculateToolbarPosition();
  },
  onClick: handleContentClick,
};