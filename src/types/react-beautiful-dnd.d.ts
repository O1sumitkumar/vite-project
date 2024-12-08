declare module 'react-beautiful-dnd' {
  import type { ComponentType, ReactElement } from 'preact';

  export interface DraggableProvided {
    draggableProps: {
      style?: {
        [key: string]: any;
      };
      [key: string]: any;
    };
    dragHandleProps: {
      [key: string]: any;
    } | null;
    innerRef: (element: HTMLElement | null) => void;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: {
      [key: string]: any;
    };
    placeholder?: ReactElement;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    children: (provided: DraggableProvided) => ReactElement;
  }

  export interface DroppableProps {
    droppableId: string;
    children: (provided: DroppableProvided) => ReactElement;
  }

  export const DragDropContext: ComponentType<{
    onDragEnd: (result: any) => void;
    children: ReactElement;
  }>;

  export const Droppable: ComponentType<DroppableProps>;
  export const Draggable: ComponentType<DraggableProps>;
} 