import React from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  newTodoInput: string;
  setNewTodoInput: React.Dispatch<React.SetStateAction<string>>;
  addTodo: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  toggleAllTodos: (makeCompleted: boolean) => Promise<boolean[]>;
  newInputRef: React.RefObject<HTMLInputElement>;
};

export const TodoHeader: React.FC<Props> = ({
  todos,
  newTodoInput,
  setNewTodoInput,
  addTodo,
  isLoading,
  toggleAllTodos,
  newInputRef,
}) => {
  const isAllCompleted =
    todos.length > 0 && todos.every(todo => todo.completed);

  const handleToggleAll = () => {
    toggleAllTodos(!isAllCompleted);
  };

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: isAllCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={handleToggleAll}
        />
      )}

      <form onSubmit={addTodo}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTodoInput}
          onChange={event => setNewTodoInput(event.target.value)}
          ref={newInputRef}
          disabled={isLoading}
        />
      </form>
    </header>
  );
};
