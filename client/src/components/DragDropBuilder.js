import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from '../styles/Builder.module.css';

export function DragDropBuilder({ blocks, setBlocks }) {
  const onDragEnd = (result) => {
    if (!result.destination) return; // dropped outside

    const newBlocks = Array.from(blocks);
    const [moved] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, moved);
    setBlocks(newBlocks);
  };

  return (
    <div className={styles.builderContainer}>
      <h3>Drag/Drop Builder</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks-droppable">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.dragDropArea}
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(draggableProv) => (
                    <div
                      ref={draggableProv.innerRef}
                      {...draggableProv.draggableProps}
                      {...draggableProv.dragHandleProps}
                      className={styles.blockItem}
                      style={draggableProv.draggableProps.style}
                    >
                      <strong>{block.type.toUpperCase()}</strong>
                      <p>{block.content}</p>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
