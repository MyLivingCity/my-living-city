import { Container } from 'react-bootstrap';
import AccountPricingContent from '../components/content/AccountPricingContent';
import ProposalLimitManager from 'src/components/content/ProposalLimitManager';

export default function PricingAndLimitManagerPage() {
    return (
        <div className='wrapper'> 
            <Container className='mb-4 mt-4'>
                <h2 className='pb-2 pt-2 display-6'>Pricing and Limit Manager</h2>

                {/* Scope - C2-004 */}
                <AccountPricingContent />

                {/* Proposal Limit */}
                <ProposalLimitManager />
            </Container>  
        </div>
        
    );
}
