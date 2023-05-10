import React from "react";
import { ShowSubSegments } from "src/components/content/SegmentManagementContent";
import LoadingSpinner from "src/components/ui/LoadingSpinner";
import { useAllSubSegmentsWithId } from "src/hooks/segmentHooks";

export interface ShowSubSegmentsPageProps {
    segId: number;
    token: any;
    segName: string | null | undefined;
  }
export const ShowSubSegmentsPage: React.FC<ShowSubSegmentsPageProps> = ({segId, token, segName}) => {
    const { data } = useAllSubSegmentsWithId(String(segId));
    return (
    <>
        <ShowSubSegments data={data} segId={segId} token={token} segName={segName}/>
    </>
    )
}
