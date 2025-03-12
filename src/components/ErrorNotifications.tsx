import React, { useEffect } from 'react';
import classNames from 'classnames';

type Props = {
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

export const ErrorNotifications: React.FC<Props> = ({
  errorMessage,
  setErrorMessage,
}) => {
  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setErrorMessage('');
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [errorMessage, setErrorMessage]);

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification',
        'is-danger',
        'is-light',
        'has-text-weight-normal',
        { hidden: !errorMessage },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={() => setErrorMessage('')}
      />
      {errorMessage}
    </div>
  );
};
