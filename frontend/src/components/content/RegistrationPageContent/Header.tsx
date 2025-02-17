import { USER_TYPES } from 'src/lib/constants';
import Stepper from 'react-stepper-horizontal';
import { useState } from 'react';

type HeaderProps = {
    step: Number,
    userType: string,
}

function Header(props:HeaderProps) {
    const getStepHeader = (step: number) => {
        switch (step) {
            case 1:
                return 'Select Account Type';
            case 2:
                return 'Create Account';
            case 3:
                return 'Community Location';
            case 4:
                return props.userType === USER_TYPES.RESIDENTIAL
                    ? 'User Agreement and Community Guidelines'
                    : 'Reach';
            case 5:
                return props.userType === USER_TYPES.RESIDENTIAL ? 'Submit' : 'User Agreement and Community Guidelines'; 
            case 6:
                return props.userType === USER_TYPES.RESIDENTIAL
                    ? ''
                    : 'Submit';
            case 7:
                return props.userType === USER_TYPES.RESIDENTIAL ? '' : 'Create Ad';
            default:
                return '';
        }
    };

    return(
        <div className='stepper mb-4'>
            {props.userType === USER_TYPES.RESIDENTIAL ? (
                <Stepper
                    steps={[
                        { title: `${getStepHeader(1)}` },
                        { title: `${getStepHeader(2)}` },
                        { title: `${getStepHeader(3)}` },
                        { title: `${getStepHeader(4)}` },
                    ]}
                    activeStep={Number(props.step) - 1}
                    circleTop={0}
                    lineMarginOffset={8}
                    activeColor={'#98cc74'}
                    completeColor={'#98cc74'}
                    completeBarColor={'#98cc74'}
                    titleFontSize={19}
                />
            ) : (
                <Stepper
                    steps={[
                        { title: `${getStepHeader(1)}` },
                        { title: `${getStepHeader(2)}` },
                        { title: `${getStepHeader(3)}` },
                        { title: `${getStepHeader(4)}` },
                        { title: `${getStepHeader(5)}` },
                        { title: `${getStepHeader(6)}` },
                    ]}
                    activeStep={Number(props.step) - 1}
                    circleTop={0}
                    lineMarginOffset={8}
                    activeColor={'#98cc74'}
                    completeColor={'#98cc74'}
                    completeBarColor={'#98cc74'}
                    titleFontSize={19}
                />
            )}
        </div>
    );
}

export default Header;