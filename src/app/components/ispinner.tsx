import "ispinner.css/ispinner.css";
import React from "react";

export default function ISpinner({
  large,
}: Readonly<{ large?: boolean }>): React.ReactNode {
  if (large) {
    return (
      <div className="ispinner ispinner-large">
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
      </div>
    );
  } else {
    return (
      <div className="ispinner">
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
        <div className="ispinner-blade"></div>
      </div>
    );
  }
}
