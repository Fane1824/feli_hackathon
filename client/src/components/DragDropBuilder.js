import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from '../styles/Builder.module.css';
import { QuizBlock } from './QuizBlock';

export function DragDropBuilder({ blocks, setBlocks }) {
  const [newBlockContent, setNewBlockContent] = useState('');
  const [blockType, setBlockType] = useState('theory');
  const [error, setError] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const addNewBlock = () => {
    setError('');
    
    if (!newBlockContent.trim()) {
      setError('Please enter some content');
      return;
    }

    if (newBlockContent.trim().length < 20) {
      setError('Content should be at least 20 characters long');
      return;
    }
    
    const newBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      content: newBlockContent.trim()
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setNewBlockContent('');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return; // dropped outside

    const newBlocks = Array.from(blocks);
    const [moved] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, moved);
    setBlocks(newBlocks);
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        if (content.trim().length < 20) {
          setError('File content should be at least 20 characters long');
          return;
        }
        
        const newBlock = {
          id: `theory-${Date.now()}`,
          type: 'theory',
          content: content.trim()
        };
        
        setBlocks(prev => [...prev, newBlock]);
      };
      reader.readAsText(file);
    } else {
      setError('Please drop a .txt file');
    }
  }, [setBlocks]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  }, []);

  const handleTextareaFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewBlockContent(event.target.result);
      };
      reader.onerror = () => {
        setError('Failed to read file content');
      };
      reader.readAsText(file);
    } else {
      setError('Please drop a .txt file');
    }
  }, []);

  // Render function for block content based on type
  const renderBlockContent = (block) => {
    switch (block.type) {
      case 'quiz':
        return <QuizBlock content={block.content} />;
      default:
        return <div>{block.content}</div>;
    }
  };

  return (
    <div className={styles.builderContainer}>
      <div className={styles.addBlockForm}>
        <h3>Add New Content Block</h3>
        <select 
          value={blockType} 
          onChange={(e) => setBlockType(e.target.value)}
          className={styles.blockTypeSelect}
        >
          <option value="theory">Theory Block</option>
          <option value="procedure">Procedure Block</option>
        </select>
        
        <div className={`${styles.textareaContainer} ${isDraggingFile ? styles.dragging : ''}`}>
          <textarea
            value={newBlockContent}
            onChange={(e) => setNewBlockContent(e.target.value)}
            placeholder={`Drag & drop a .txt file or type ${blockType} content here...`}
            className={styles.blockInput}
            rows={6}
            onDrop={handleTextareaFileDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
            }}
          />
          {isDraggingFile && (
            <div className={styles.dropOverlay}>
              <p>Drop .txt file to paste content</p>
            </div>
          )}
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        <button onClick={addNewBlock} className={styles.addBlockButton}>
          Add {blockType === 'theory' ? 'Theory' : 'Procedure'} Block
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className={styles.emptyState}>
          Add theory and procedure blocks to start building your lab
        </div>
      ) : (
        <div>
          <h3>Lab Content Blocks</h3>
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
                          {renderBlockContent(block)}
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
      )}
    </div>
  );
}
