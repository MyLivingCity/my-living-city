import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner() {
    return (
        <div className='loading-spinner-container'>
            <Spinner animation='border' className='loading-spinner'/>
        </div>
    );
}
