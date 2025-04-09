/* eslint-disable */

import { FormikStep } from '../RegisterPageContent4';

function UserAgreement({ submitError }: { submitError: any }) {
    return (
      <>
        <FormikStep>
          <>
            <p>
              It takes a lot to bring an idea to form, and as a user on the MLC
              Community Discussion Platform the following agreements will enable
              the interactions that turn ideas into reality:
            </p>
            <p>
              <strong>
                1. Ideas, comments and people are treated with respect;
              </strong>
            </p>
            <p>
              <strong>
                2. Commenting on an idea is designed to flesh it out in more detail
                to get as much constructive feedback and viewpoints from the community.
              </strong>
            </p>
            <p> The following works when commenting:</p>
            <p className="ml-4">
              a. Emphasize what you see that works about the idea and what is the
              value that it brings;
            </p>
            <p className="ml-4">
              b. Identify areas that don’t work and suggest how they can be improved;
            </p>
            <p className="ml-4">
              c. Opinions and judgments don’t add value to the conversation; and
            </p>
            <p className="ml-4">
              d. Share about where else this idea can go or what new angle can be
              added to make it even better for the whole community.
            </p>
            <p>
              <strong>
                3. Your ideas and experience is valuable and we want to hear from
                everyone how to make this an actual project that works in the
                community.
              </strong>
            </p>
            <p>By clicking next you confirm:</p>
            <p className="ml-4">
              a. Your acceptance to follow these community guidelines;
            </p>
            <p className="ml-4">
              b. That MyLivingCity has the right to store and process your personal
              information shared with the platform.
            </p>
          </>
        </FormikStep>
      </>
    );
  }

  export default UserAgreement;