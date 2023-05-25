import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery, { subgraphs } from './useGraphQuery';
import useWeb3 from '@/services/web3/useWeb3';
import { Network } from '@/lib/config';

const networkSubgraphGagesMap = {
  [Network.MAINNET]:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-beta',
  [Network.ARBITRUM]:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-arbitrum-beta',
};

export interface VotingEscrowLock {
  id: string;
  slope: string;
  bias: string;
}

export interface VotingEscrowLockResponse {
  votingEscrowLocks: VotingEscrowLock[];
}

const attrs = {
  id: true,
  bias: true,
  slope: true,
};

export function useVotingEscrowLocksQuery(
  networkId: Network,
  user: ComputedRef<string | undefined>
) {
  console.log('net', networkId);
  const { account } = useWeb3();

  const votingEscrowLocksQueryEnabled = computed(() => {
    if (!account.value) {
      return false;
    }

    if (networkId === Network.MAINNET) {
      return true;
    }

    // we need remote user for l2s
    return !!user.value;
  });

  return useGraphQuery<VotingEscrowLockResponse>(
    networkSubgraphGagesMap[networkId],
    QUERY_KEYS.Gauges.VotingEscrowLocksByNetworkId(networkId, account.value),
    () => ({
      votingEscrowLocks: {
        __args: {
          where: {
            user: user.value?.toLowerCase(),
          },
        },
        ...attrs,
      },
    }),
    reactive({ enabled: votingEscrowLocksQueryEnabled })
  );
}
