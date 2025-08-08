import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast" // Certifique-se de que este caminho está correto

// Ajustado: Tempo para remover o toast, 5 segundos é um bom padrão
const TOAST_REMOVE_DELAY = 5000 // <<<< CORRIGIDO: Reduzido o tempo de exibição do toast

const TOAST_LIMIT = 1 // Limite de toasts exibidos simultaneamente

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Note: `dispatch` é uma função global (ou quase).
// A função `addToRemoveQueue` precisa dela no escopo.
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    // O dispatch aqui se refere à função `dispatch` declarada abaixo,
    // que é alcançável por closure ou por ser de alto nível.
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        // Limita o número de toasts exibidos
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Se um toast específico for dispensado, adicione-o à fila de remoção.
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // Se nenhum toastId for especificado, dispense todos os toasts abertos.
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Define 'open' como false para animar o fechamento
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // Remove o toast do array de toasts.
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [], // Remove todos se nenhum toastId for especificado
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

// A função `dispatch` é declarada aqui em um escopo mais alto
// para que `addToRemoveQueue` possa acessá-la via closure ou escopo global.
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        // Quando o toast é fechado (via clique, etc.), chame dismiss
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Adiciona o setState do hook como um listener.
    // Isso garante que o componente que usa useToast será re-renderizado
    // quando o memoryState global mudar.
    listeners.push(setState)
    return () => {
      // Limpeza: remove o listener quando o componente é desmontado.
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, []) // <<<< CORRIGIDO: Removido `state` das dependências. Rodará apenas uma vez.

  return {
    ...state,
    toast, // Re-exporta a função global toast
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }