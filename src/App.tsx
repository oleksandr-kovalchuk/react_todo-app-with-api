import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Todo } from './types/Todo';
import * as apiService from './api/todos';
import { TodoHeader } from './components/TodoHeader';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { ErrorNotifications } from './components/ErrorNotifications';
import { TypeFilter } from './types/TypeFilter';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [newTodoInput, setNewTodoInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [filterBy, setFilterBy] = useState(TypeFilter.All);
  const [hasTitleFocus, setHasTitleFocus] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);

  const completedTodos = todos.filter(todo => todo.completed);
  const activeTodos = todos.filter(todo => !todo.completed);
  const activeCount = activeTodos.length;

  const showError = useCallback((message: string) => {
    setErrorMessage(message);

    // Clear error after 3 seconds
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  }, []);

  const getFilteredTodos = () => {
    switch (filterBy) {
      case TypeFilter.Active:
        return activeTodos;
      case TypeFilter.Completed:
        return completedTodos;
      default:
        return todos;
    }
  };

  // Focus the input field on component mount
  useEffect(() => {
    newInputRef.current?.focus();
  }, [hasTitleFocus]);

  // Load todos from API on component mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const loadedTodos = await apiService.getTodos();

        setTodos(loadedTodos);
      } catch (error) {
        showError('Unable to load todos');
      }
    };

    loadTodos();
  }, [showError]);

  const addTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTodoInput.trim();

    if (!title) {
      showError('Title should not be empty');

      return;
    }

    setIsLoading(true);
    setHasTitleFocus(true);

    const userId = apiService.USER_ID;
    const newTodoData = { userId, title, completed: false };

    // Create a temporary todo to show immediately
    setTempTodo({ id: 0, ...newTodoData });

    try {
      const addedTodo = await apiService.createTodo(newTodoData);

      setTodos(currentTodos => [...currentTodos, addedTodo]);
      setNewTodoInput('');

      // Focus the input field after adding a todo
      setTimeout(() => {
        newInputRef.current?.focus();
      }, 0);
    } catch (error) {
      showError('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setIsLoading(false);
      setHasTitleFocus(false);
    }
  };

  const deleteTodos = async (todoIds: number[]) => {
    if (!todoIds.length) {
      return;
    }

    setLoadingIds(todoIds);
    setHasTitleFocus(true);

    const deletePromises = todoIds.map(async todoId => {
      try {
        await apiService.deleteTodo(todoId);
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      } catch (error) {
        showError('Unable to delete a todo');
      }
    });

    await Promise.all(deletePromises);
    setLoadingIds([]);
    setHasTitleFocus(false);
  };

  const updateTodos = async (todosToUpdate: Todo[]) => {
    if (!todosToUpdate.length) {
      return [];
    }

    const todoIds = todosToUpdate.map(todo => todo.id);

    setLoadingIds(todoIds);

    const updatePromises = todosToUpdate.map(async todoToUpdate => {
      try {
        await apiService.updateTodo(todoToUpdate);
        setTodos(currentTodos =>
          currentTodos.map(todo =>
            todo.id === todoToUpdate.id ? todoToUpdate : todo,
          ),
        );

        return true;
      } catch (error) {
        showError('Unable to update a todo');

        return false;
      }
    });

    const results = await Promise.all(updatePromises);

    setLoadingIds([]);

    return results;
  };

  const toggleTodos = async (todosToToggle: Todo[]) => {
    const updatedTodos = todosToToggle.map(todo => ({
      ...todo,
      completed: !todo.completed,
    }));

    const results = await updateTodos(updatedTodos);

    return results;
  };

  const toggleAllTodos = async (makeCompleted: boolean) => {
    const todosToUpdate = makeCompleted ? activeTodos : completedTodos;

    const updatedTodos = todosToUpdate.map(todo => ({
      ...todo,
      completed: makeCompleted,
    }));

    const results = await updateTodos(updatedTodos);

    return results;
  };

  const clearCompletedTodos = async () => {
    const completedIds = completedTodos.map(todo => todo.id);

    await deleteTodos(completedIds);
  };

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
          newInputRef={newInputRef}
        />

        <TodoList
          todos={getFilteredTodos()}
          deleteTodos={deleteTodos}
          tempTodo={tempTodo}
          isLoading={isLoading}
          loadingIds={loadingIds}
          toggleTodos={toggleTodos}
          updateTodos={updateTodos}
          focusInput={() => newInputRef.current?.focus()}
        />

        {todos.length > 0 && (
          <TodoFooter
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            activeCount={activeCount}
            hasCompleted={completedTodos.length > 0}
            clearCompletedTodos={clearCompletedTodos}
          />
        )}
      </div>

      <ErrorNotifications
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
