import { RouteComponentProps } from 'react-router-dom';
import EditAdPricingPageContent from '../components/content/EditAdPricingPageContent';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAllAdPrices } from '../hooks/adPriceHooks';
// Extends Route component props
interface EditAdPricingPageProps extends RouteComponentProps<{}> {
    // Add custom added props here 
}

const EditAdPricingPage: React.FC<EditAdPricingPageProps> = () => {
    const { data: adPriceOptions, isLoading } = useAllAdPrices();

    if (isLoading) {
        return (
            <div className='wrapper'>
                <LoadingSpinner />
            </div>);
    }

    return (
        <div className='wrapper'>
            <EditAdPricingPageContent
                adPriceOptions={adPriceOptions}
            />
        </div>
    );
};

export default EditAdPricingPage;