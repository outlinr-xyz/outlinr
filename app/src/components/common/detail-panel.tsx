import { type ReactNode, createContext, useContext, useState } from "react";
import { IconX } from "./icons";

interface DetailPanelContextType {
  isOpen: boolean;
  content: ReactNode | null;
  openPanel: (content: ReactNode) => void;
  closePanel: () => void;
}

const DetailPanelContext = createContext<DetailPanelContextType>({
  isOpen: false,
  content: null,
  openPanel: () => {},
  closePanel: () => {},
});

export function useDetailPanel() {
  return useContext(DetailPanelContext);
}

export function DetailPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  function openPanel(node: ReactNode) {
    setContent(node);
    setIsOpen(true);
  }

  function closePanel() {
    setIsOpen(false);
    setTimeout(() => setContent(null), 300);
  }

  return (
    <DetailPanelContext.Provider
      value={{ isOpen, content, openPanel, closePanel }}
    >
      {children}
    </DetailPanelContext.Provider>
  );
}

export function DetailPanel() {
  const { isOpen, content, closePanel } = useDetailPanel();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePanel}
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200/60 shadow-float z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-400 tracking-wide">
            DETAILS
          </p>
          <button
            onClick={closePanel}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-1 transition-colors cursor-pointer"
          >
            <IconX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-57px)] p-6">{content}</div>
      </div>
    </>
  );
}
