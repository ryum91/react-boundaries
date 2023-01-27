/**
 * ## @kakaopay/reusables/error-handler
 * {@link Boundary}에서 사용되는 인터페이스
 * @module
 */
import { ReactElement, ReactNode } from 'react';

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
 * {@link Boundary}에서 사용되는 ErrorHandler 인터페이스<br/>
 * 해당 인터페이스를 구현해서 ErrorBoundary Fallback 컴포넌트를 제작하세요.
 */
export interface ErrorHandler {
  /** ErrorHandler가 동작했을 때 렌더링되는 Fallback 컴포넌트 */
  fallback: (props: ErrorFallbackComponentProps) => ReactElement;
  /** ErrorHandler가 동작하는 조건 */
  condition: (error: Error) => boolean;
}
