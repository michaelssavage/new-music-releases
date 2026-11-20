import { Button } from "@client/components/Button";
import { ConfigCard, ConfigCardHeader } from "@client/components/ConfigCard";
import { Loader } from "@client/components/Loader";
import { getAccounts, setAccountVerified } from "@client/lib/spotify";
import styled from "@emotion/styled";
import type { AccountI } from "@model/accounts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const AccountList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
    border-top: 1px solid #e5e7eb;
  }
`;

const Name = styled.div`
  display: flex;
  flex-direction: column;

  small {
    color: #6b7280;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Status = styled.span<{ verified: boolean }>`
  font-weight: bold;
  color: ${({ verified }) => (verified ? "#15803d" : "#b45309")};
`;

const LoaderStyled = styled.div`
  margin: 2rem;
  display: flex;
  justify-content: center;
`;

const statusLabel = ({ isAdmin, verified }: AccountI) => {
  if (isAdmin) return "Admin";
  return verified ? "Verified" : "Pending";
};

export const Accounts = () => {
  const queryClient = useQueryClient();
  const {
    data: accounts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending, variables } = useMutation({
    mutationFn: setAccountVerified,
    onSuccess: async (_data, { verified }) => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(verified ? "Account verified" : "Verification removed");
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <LoaderStyled>
        <Loader />
      </LoaderStyled>
    );
  }

  if (isError || !accounts) return <div>Couldn't load accounts</div>;

  return (
    <ConfigCard>
      <ConfigCardHeader>
        <h2>Accounts</h2>
      </ConfigCardHeader>
      <AccountList>
        {accounts.map((account) => (
          <li key={account.userId}>
            <Name>
              {account.displayName}
              {account.displayName !== account.userId && (
                <small>{account.userId}</small>
              )}
            </Name>
            <Actions>
              <Status verified={account.verified}>
                {statusLabel(account)}
              </Status>
              {!account.isAdmin && (
                <Button
                  text={account.verified ? "Revoke" : "Verify"}
                  variant={account.verified ? "remove" : "primary"}
                  loading={isPending && variables?.userId === account.userId}
                  disabled={isPending}
                  onClick={() =>
                    mutate({
                      userId: account.userId,
                      verified: !account.verified,
                    })
                  }
                />
              )}
            </Actions>
          </li>
        ))}
      </AccountList>
    </ConfigCard>
  );
};
