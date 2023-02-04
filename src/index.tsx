import { ReactElement, ReactNode, Suspense, useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

export { useErrorHandler } from 'react-error-boundary';

const isBrowser = () => typeof window !== 'undefined';

/**
 * Fallback 컴포넌트 제작시 사용할 수 있는 Props
 */
export interface ErrorFallbackComponentProps {
  /** {@link Boundary}에서 전달되어 넘어온 customEvents */
  customEvents?: Record<string, () => void>;
  /** Fulfilled 컴포넌트 */
  children: ReactNode;
  /** 발생한 에러 */
  error: Error;
  /** ErrorBoundary Reset */
  reset: () => void;
}

/**
 * Boundary에서 사용되는 ErrorHandler 인터페이스<br/>
 * 해당 인터페이스를 구현해서 ErrorBoundary Fallback 컴포넌트를 제작하세요.
 */
export interface ErrorHandler {
  /** ErrorHandler가 동작했을 때 렌더링되는 Fallback 컴포넌트 */
  fallback: (props: ErrorFallbackComponentProps) => ReactElement;
  /** ErrorHandler가 동작하는 조건 */
  condition: (error: Error) => boolean;
}

const FallbackParent = ({
  reset,
  children,
}: {
  reset: () => void;
  children: ReactElement;
}) => {
  useEffect(() => {
    if (isBrowser()) {
      window.addEventListener('popstate', reset);
    }
    return () => {
      if (isBrowser()) {
        window.removeEventListener('popstate', reset);
      }
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
    return <Suspense fallback={pendingFallback}>{children}</Suspense>;
  }

  return (
    <ErrorBoundary
      rejectedHandler={rejectedHandler}
      customEvents={customEvents}
      onReset={onReset}
    >
      {pendingFallback ? (
        <Suspense fallback={pendingFallback}>{children}</Suspense>
      ) : (
        children
      )}
    </ErrorBoundary>
  );
}

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
