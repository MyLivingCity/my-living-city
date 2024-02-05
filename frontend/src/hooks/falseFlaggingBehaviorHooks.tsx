import { useQuery } from 'react-query'
import { getAllFalseFlaggingUsers } from 'src/lib/api/falseFlaggingBehaviorRoutes'
import { IFetchError } from 'src/lib/types/types'
import { IFalseFlagBehavior } from 'src/lib/types/data/flag.type'

export const useAllFalseFlaggingUsers = () => {
  return useQuery<IFalseFlagBehavior[], IFetchError>(
    ['false-flagging-users'],
    () => getAllFalseFlaggingUsers(),
  )
}

