"use client";
import * as React from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

const LoadMore = ({
  children,
  initialOffset = 20,
  loadMoreAction,
}: React.PropsWithChildren<{
  initialOffset?: number;
  loadMoreAction: (
    offset: number
  ) => Promise<readonly [React.JSX.Element, number | string | null]>;
}>) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [loadMoreNodes, setLoadMoreNodes] = React.useState<React.JSX.Element[]>(
    []
  );
  const [disabled, setDisabled] = React.useState(false);
  const currentRef = React.useRef(initialOffset);
  const [scrollLoad, setScrollLoad] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const loadMore = React.useCallback(
    async (abortController?: AbortController) => {
      setLoading(true);
      loadMoreAction(currentRef.current)
        .then(([node, next]) => {
          if (abortController?.signal.aborted) return;

          setLoadMoreNodes((prev) => [...prev, node]);
          if (next === null) {
            currentRef.current = -1;
            setDisabled(true);
            return;
          }

          currentRef.current = next as number;
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [loadMoreAction]
  );

  React.useEffect(() => {
    const signal = new AbortController();

    const element = ref.current;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && element?.disabled === false) {
        loadMore(signal);
      }
    });

    if (element && scrollLoad) {
      observer.observe(element);
    }

    return () => {
      signal.abort();
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [loadMore, scrollLoad]);

  return (
    <>
      <div className="fixed container top-4 z-50 flex justify-end">
        <Label htmlFor="scrollLoad" className="cursor-pointer">
          <Card className="w-max flex p-4 gap-4 items-center m-2">
            <Switch
              id="scrollLoad"
              onCheckedChange={() => setScrollLoad((prev) => !prev)}
              checked={scrollLoad}
            ></Switch>
            <span>Fetch on scroll</span>
          </Card>
        </Label>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-12 relative">
        {children}
        {loadMoreNodes}
      </div>
      <Button
        variant="outline"
        size="lg"
        ref={ref}
        disabled={disabled || loading}
        onClick={() => loadMore()}
      >
        {loading ? "Loading..." : "Load More"}
      </Button>
    </>
  );
};

export default LoadMore;
