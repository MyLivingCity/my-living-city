import { useQuery } from 'react-query'
import { getMyUserSegmentInfo, getMyUserSegmentInfoRefined} from 'src/lib/api/userSegmentRoutes'
import { IFetchError } from '../lib/types/types'
export const useAllUserSegments = (token: string | null, userId: string | null) => {
    return useQuery<any, IFetchError>(
      ['segments', token],
      () => getMyUserSegmentInfo(token, userId),
    )
  }
  export const useAllUserSegmentsRefined = (token: string | null, userId: string | null) => {
    return useQuery<any, IFetchError>(
      ['segments', token],
      () => getMyUserSegmentInfoRefined(token, userId),
    )
  }
  // export const useAllUserSegDataWithInfo = (token: string | null) => {
  //   return useQuery<any, IFetchError>(
  //     ['segments', token],
  //     () => getAllUserSegInfo(token),
  //   )
  // }