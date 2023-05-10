import React from 'react'
import { RouteComponentProps } from 'react-router-dom';
import EditAdsPageContent from '../components/content/EditAdsPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAdvertisements } from '../hooks/advertisementHooks';
import { UserProfileContext } from '../contexts/UserProfile.Context';
import { useContext } from 'react';
import { useSingleAdvertisement } from 'src/hooks/editAdsHooks';

// Extends Route component props with idea title route param
interface EditAdsPageProps extends RouteComponentProps<{}> {
  // Add custom added props here 
}

const EditAdsPage: React.FC<EditAdsPageProps> = ({}) => {
  // const { token } = useContext(UserProfileContext);

  const currentUrl = window.location.search;
  const search = new URLSearchParams(currentUrl);
  //console.log(currentUrl);
  const id = search.get('id');
  console.log(id);

  const { data, isLoading, error, isError } = useSingleAdvertisement(id);
  // console.log(data);
  
  if (isLoading) {
    <div className="wrapper">
      <LoadingSpinner />
    </div>
  }

  // TODO: Create non blocking error handling

  return (
    <div className="wrapper">
      <EditAdsPageContent adsData={data}/>
    </div>
  );
}

export default EditAdsPage