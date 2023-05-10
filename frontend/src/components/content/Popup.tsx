import React from "react";

const Popup = (props: any) => {
  return (
    <>
      <style>
        {`.popup-box {
                position: fixed;
                background: #00000050;
                width: 100%;
                height: 100vh;
                top: 0;
                left: 0;
                z-index: 1;
                }
                
                .box {
                position: relative;
                width: 70%;
                margin: 0 auto;
                height: auto;
                max-height: 80vh;
                margin-top: calc(100vh - 85vh - 20px);
                background: #fff;
                border-radius: 4px;
                padding: 2rem;
                border: 1px solid #999;
                overflow: auto;
                text-align: left;
                }
                
                .close-icon {
                content: 'x';
                cursor: pointer;
                position: fixed;
                right: calc(15% - 30px);
                top: calc(100vh - 85vh - 33px);
                background: #ededed;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                line-height: 20px;
                text-align: center;
                border: 1px solid #999;
                font-size: 20px;

                }`}
      </style>
      <div className="popup-box">
        <div className="box">
          <span className="close-icon" onClick={props.handleClose}>
            x
          </span>
          {props.content}
        </div>
      </div>
    </>
  );
};

export default Popup;
