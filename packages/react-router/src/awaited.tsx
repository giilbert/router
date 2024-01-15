import { useRouter } from './RouterProvider'
import { DeferredPromise, isDehydratedDeferred } from './defer'

export type AwaitOptions<T> = {
  promise: DeferredPromise<T>
}

export function useAwaited<T>({ promise }: AwaitOptions<T>): [T] {
  const router = useRouter()
  console.log('useAwaited')

  let state = promise.__deferredState
  const key = `__TSR__DEFERRED__${state.uid}`

  if (isDehydratedDeferred(promise)) {
    state = router.hydrateData(key)!
    promise = Promise.resolve(state.data) as DeferredPromise<any>
    promise.__deferredState = state
  }

  if (state.status === 'pending') {
    throw new Promise((r) => setTimeout(r, 1)).then(() => promise)
  }

  if (state.status === 'error') {
    throw state.error
  }

  console.log('dehydrating', key)
  router.dehydrateData(key, state)

  return [state.data]
}

export function Await<T>(
  props: AwaitOptions<T> & {
    children: (result: T) => JSX.Element
  },
) {
  console.log('Await')
  const awaited = useAwaited(props)
  return props.children(...awaited)
}
