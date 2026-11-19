import { useInView } from "@client/hooks/use-in-view.hook";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Button } from "./Button";

interface LoadMoreProps {
  loadedCount: number;
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0 1rem;
`;

const Count = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
`;

/** Auto-loading only starts after the first manual click. */
export const LoadMore = ({
  loadedCount,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: LoadMoreProps) => {
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const { ref, isInView } = useInView("400px");

  useEffect(() => {
    if (
      isAutoLoading &&
      isInView &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError
    ) {
      onLoadMore();
    }
  }, [
    isAutoLoading,
    isInView,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    onLoadMore,
  ]);

  const handleLoadMore = () => {
    setIsAutoLoading(true);
    onLoadMore();
  };

  return (
    <Container ref={ref}>
      <Count>
        Showing {loadedCount} of {totalCount}
      </Count>
      {hasNextPage && (
        <Button
          onClick={handleLoadMore}
          text="Load more"
          variant="secondary"
          loading={isFetchingNextPage}
          disabled={isFetchingNextPage}
        />
      )}
    </Container>
  );
};
