import React from 'react';
import classNames from 'classnames';
import { TypeFilter } from '../types/TypeFilter';

type Props = {
  filterBy: TypeFilter;
  setFilterBy: React.Dispatch<React.SetStateAction<TypeFilter>>;
  activeCount: number;
  hasCompleted: boolean;
  clearCompletedTodos: () => void;
};

export const TodoFooter: React.FC<Props> = ({
  filterBy,
  setFilterBy,
  activeCount,
  hasCompleted,
  clearCompletedTodos,
}) => {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>

      <nav className="filter" data-cy="Filter">
        {Object.values(TypeFilter).map(filterType => (
          <a
            href={`#/${filterType}`}
            key={filterType}
            className={classNames('filter__link', {
              selected: filterType === filterBy,
            })}
            data-cy={`FilterLink${filterType}`}
            onClick={() => setFilterBy(filterType)}
          >
            {filterType}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!hasCompleted}
        onClick={clearCompletedTodos}
      >
        Clear completed
      </button>
    </footer>
  );
};
