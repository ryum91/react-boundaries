import { ReactElement, ReactNode, Suspense, useEffect } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  useErrorHandler as useErrorHandlerOrigin,
} from 'react-error-boundary';

import { ErrorHandler } from './type';
export { ErrorFallbackComponentProps, ErrorHandler } from './type';

const FallbackParent = ({
  reset,
  children,
}: {
  reset: () => void;
  children: ReactElement;
}) => {
  useEffect(() => {
    window.addEventListener('popstate', reset);
    return () => {
      window.removeEventListener('popstate', reset);
    };
  }, [reset]);
  return <>{children}</>;
};

interface ErrorBoundaryProps {
  rejectedHandler: ErrorHandler[];
  customEvents?: Record<string, () => void>;
  children: ReactNode;
  onReset?: () => void;
}

const ErrorBoundary = ({
  rejectedHandler,
  customEvents,
  children,
  onReset,
}: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => {
        const findHandler = rejectedHandler.find(({ condition }) =>
          condition(error)
        );

        if (findHandler) {
          return (
            <FallbackParent reset={resetErrorBoundary}>
              {findHandler.fallback({
                error,
                reset: resetErrorBoundary,
                customEvents,
                children,
              })}
            </FallbackParent>
          );
        }

        throw error;
      }}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

/**
 * Boundary 컴포넌트 Props
 */
export interface BoundaryProps {
  /** React Suspense에서 사용되는 Fallback 컴포넌트 (전달되지 않는 경우 ErrorBoundary 만 사용합니다.) */
  pendingFallback?: ReactNode;
  /** ErrorBoundary 에서 사용되는 ErrorHandler 배열 (전달되지 않는 경우 React Suspense 만 사용합니다.) */
  rejectedHandler?: ErrorHandler[];
  /** ErrorBoundary Fallback 컴포넌트에 전달되는 커스텀 이벤트 */
  customEvents?: Record<string, () => void>;
  /** Fulfilled 컴포넌트 (Fulfilled 컴포넌트에 overlay로 ErrorBoundary Fallback을 구현하는 경우에만 사용하세요) */
  children: ReactNode;
  onReset?: () => void;
}

/**
 * React Suspense 와 ErrorBoundary 컴포넌트를 한 번에 사용할 수 있는 컴포넌트
 *
 * @param props
 * @returns
 */
export function Boundary(props: BoundaryProps) {
  const { pendingFallback, rejectedHandler, customEvents, children, onReset } =
    props;

  if (!rejectedHandler && !pendingFallback) {
    return <>{children}</>;
  }

  if (!rejectedHandler) {
    return <Suspense fallback={pendingFallback!}>{children}</Suspense>;
  }

  if (!pendingFallback) {
    return (
      <ErrorBoundary
        rejectedHandler={rejectedHandler}
        customEvents={customEvents}
        onReset={onReset}
      >
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      rejectedHandler={rejectedHandler}
      customEvents={customEvents}
      onReset={onReset}
    >
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

/**
 * ErrorBoundary 를 사용하지 않는 곳에서 ErrorBoundary 로 에러를 전달하는 함수를 반환합니다.
 */
export const useErrorHandler = useErrorHandlerOrigin;

export type WithBoundaryProps = Omit<BoundaryProps, 'children'>;

/**
 * 컴포넌트를 Boundary로 한번 Wrapping 하는 HOC
 *
 * @param WrappedComponent
 * @param containerProps
 * @returns
 */
export function withBoundary(
  WrappedComponent: React.FC,
  containerProps?: WithBoundaryProps
) {
  const Container = (props: any) => {
    return (
      <Boundary {...containerProps}>
        <WrappedComponent {...props} />
      </Boundary>
    );
  };

  return Container;
}
