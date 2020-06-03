import React, { Component } from "react";

import "./RoundButton.css";

class RoundButton extends Component {
  render() {
    let theme = "RoundButton-dark";
    if (this.props.theme === "light") {
      theme = "RoundButton-light";
    }

    return (
      <div
        className={`RoundButton ${theme} ${this.props.className}`}
        onClick={() => this.props.onClick(this.props)}
      >
        {this.props.text}
      </div>
    );
  }
}

export default RoundButton;
