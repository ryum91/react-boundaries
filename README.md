# react-boundaries

## Example

```ts
import { ErrorFallbackComponentProps, ErrorHandler } from 'react-boundaries';

const CustomErrorHandler = ({ error }: ErrorFallbackComponentProps) => {
  useLayoutEffect(() => {
    console.log(error);
  }, [error]);

  return <ErrorFallback>{/* ErrorFallback Component */}</ErrorFallback>;
};

export default {
  fallback: CustomErrorHandler,
  condition: (error) => true,
} as ErrorHandler;
```

```ts
<Boundary
  pendingFallback={<div>Loading...</div>}
  rejectedHandler={[CustomErrorHandler]}
>
  <Component />
</Boundary>
```
