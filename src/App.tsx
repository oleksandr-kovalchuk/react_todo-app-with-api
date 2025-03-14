import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import * as api from './api/todos';
import { Todo } from './types/Todo';
import { TypeFilter } from './types/TypeFilter';
import { TodoHeader } from './components/TodoHeader';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { ErrorNotifications } from './components/ErrorNotifications';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [newTodoInput, setNewTodoInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<TypeFilter>(TypeFilter.All);

  const inputRef = useRef<HTMLInputElement>(null);

  const activeTodos = useMemo(
    () => todos.filter(todo => !todo.completed),
    [todos],
  );

  const completedTodos = useMemo(
    () => todos.filter(todo => todo.completed),
    [todos],
  );

  const activeCount = activeTodos.length;

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  }, []);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case TypeFilter.Active:
        return activeTodos;

      case TypeFilter.Completed:
        return completedTodos;

      default:
        return todos;
    }
  }, [filter, activeTodos, completedTodos, todos]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const todosData = await api.getTodos();

        setTodos(todosData);
      } catch (err) {
        showError('Unable to load todos');
      }
    };

    fetchTodos();
  }, [showError]);

  // Add todo
  const addTodo = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const title = newTodoInput.trim();

      if (!title) {
        showError('Title should not be empty');

        return;
      }

      setIsLoading(true);
      const userId = api.USER_ID;
      const todoData = { userId, title, completed: false };

      setTempTodo({ id: 0, ...todoData });

      try {
        const newTodo = await api.createTodo(todoData);

        setTodos(prev => [...prev, newTodo]);
        setNewTodoInput('');
        setTimeout(() => inputRef.current?.focus(), 0);
      } catch (err) {
        showError('Unable to add a todo');
      } finally {
        setTempTodo(null);
        setIsLoading(false);
      }
    },
    [newTodoInput, showError],
  );

  // Delete todos
  const deleteTodos = useCallback(
    async (ids: number[]) => {
      if (!ids.length) {
        return;
      }

      setLoadingIds(ids);
      await Promise.all(
        ids.map(async id => {
          try {
            await api.deleteTodo(id);
            setTodos(prev => prev.filter(todo => todo.id !== id));
          } catch (err) {
            showError('Unable to delete a todo');
          }
        }),
      );
      setLoadingIds([]);
      inputRef.current?.focus();
    },
    [showError],
  );

  // Update todos
  const updateTodos = useCallback(
    async (todosToUpdate: Todo[]): Promise<boolean[]> => {
      if (!todosToUpdate.length) {
        return [];
      }

      const ids = todosToUpdate.map(t => t.id);

      setLoadingIds(ids);

      const results = await Promise.all(
        todosToUpdate.map(async updatedTodo => {
          try {
            await api.updateTodo(updatedTodo);
            setTodos(prev =>
              prev.map(todo =>
                todo.id === updatedTodo.id ? updatedTodo : todo,
              ),
            );

            return true;
          } catch (err) {
            showError('Unable to update a todo');

            return false;
          }
        }),
      );

      setLoadingIds([]);

      return results;
    },
    [showError],
  );

  // Toggle todos
  const toggleTodos = useCallback(
    async (todosToToggle: Todo[]) => {
      const toggled = todosToToggle.map(todo => ({
        ...todo,
        completed: !todo.completed,
      }));

      return updateTodos(toggled);
    },
    [updateTodos],
  );

  // Toggle all todos
  const toggleAllTodos = useCallback(
    async (complete: boolean) => {
      const todosToToggle = complete ? activeTodos : completedTodos;
      const updated = todosToToggle.map(todo => ({
        ...todo,
        completed: complete,
      }));

      return updateTodos(updated);
    },
    [activeTodos, completedTodos, updateTodos],
  );

  // Clear all completed todos
  const clearCompletedTodos = useCallback(async () => {
    const completedIds = completedTodos.map(todo => todo.id);

    await deleteTodos(completedIds);
  }, [completedTodos, deleteTodos]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          todos={todos}
          newTodoInput={newTodoInput}
          setNewTodoInput={setNewTodoInput}
          addTodo={addTodo}
          isLoading={isLoading}
          toggleAllTodos={toggleAllTodos}
          newInputRef={inputRef}
        />

        <TodoList
          todos={filteredTodos}
          deleteTodos={deleteTodos}
          tempTodo={tempTodo}
          isLoading={isLoading}
          loadingIds={loadingIds}
          toggleTodos={toggleTodos}
          updateTodos={updateTodos}
          focusInput={() => inputRef.current?.focus()}
        />

        {todos.length > 0 && (
          <TodoFooter
            filterBy={filter}
            setFilterBy={setFilter}
            activeCount={activeCount}
            hasCompleted={completedTodos.length > 0}
            clearCompletedTodos={clearCompletedTodos}
          />
        )}
      </div>

      <ErrorNotifications errorMessage={error} setErrorMessage={setError} />
    </div>
  );
};
