import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  todo: Todo;
  deleteTodos: (todoIds: number[]) => Promise<void>;
  isLoading: boolean;
  loadingIds: number[];
  toggleTodos: (todos: Todo[]) => Promise<boolean[]>;
  updateTodos: (todosToUpdate: Todo[]) => Promise<boolean[]>;
  focusInput: () => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  deleteTodos,
  isLoading,
  loadingIds,
  toggleTodos,
  updateTodos,
  focusInput,
}) => {
  const { id, title, completed } = todo;

  const [editValue, setEditValue] = useState<string>(title);
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedTitle = editValue.trim();

    if (!trimmedTitle) {
      await deleteTodos([id]);
      focusInput();

      return;
    }

    if (title === trimmedTitle) {
      setEditValue(trimmedTitle);
      setIsEditing(false);
      focusInput();

      return;
    }

    setIsEditing(false);
    setEditValue(trimmedTitle);

    const updatedTodo = { ...todo, title: trimmedTitle };
    const [success] = await updateTodos([updatedTodo]);

    if (!success) {
      setIsEditing(true);
    } else {
      focusInput();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }

    if (event.key === 'Escape') {
      setIsEditing(false);
      setEditValue(title);
      focusInput();
    }
  };

  const isProcessing = isLoading || loadingIds.includes(id);

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', 'item-enter-done', { completed })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => toggleTodos([todo])}
          aria-label="Toggle todo status"
        />
      </label>

      {isEditing ? (
        <input
          data-cy="TodoTitleField"
          type="text"
          className="todo__title-field"
          placeholder="Empty todo will be deleted"
          value={editValue}
          onChange={event => setEditValue(event.target.value)}
          onKeyUp={handleKeyDown}
          onBlur={handleSave}
          ref={inputRef}
        />
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodos([id])}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal', 'overlay', {
          'is-active': isProcessing,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
