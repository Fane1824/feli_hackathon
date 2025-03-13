import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export function DragDropBuilder({ blocks, setBlocks }) {
  const onDragEnd = (result) => {
    if (!result.destination) return; // dropped outside

    const newBlocks = Array.from(blocks);
    const [moved] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, moved);
    setBlocks(newBlocks);
  };

  return (
    <div style={{
      width: '300px',
      border: '1px solid #ccc',
      minHeight: '200px',
      padding: '1rem'
    }}>
      <h3>Drag/Drop Builder</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks-droppable">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ background: '#f0f0f0', minHeight: '150px' }}
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(draggableProv) => (
                    <div
                      ref={draggableProv.innerRef}
                      {...draggableProv.draggableProps}
                      {...draggableProv.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: 8,
                        margin: '0 0 8px 0',
                        background: 'white',
                        border: '1px solid #ccc',
                        ...draggableProv.draggableProps.style
                      }}
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
