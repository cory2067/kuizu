import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RoundButton from "./RoundButton";
import { get } from "../../utilities";

class OAuth extends Component {
  constructor(props) {
    super(props);
  }

  openPopup = () => {
    const { provider } = this.props;
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    const url = `/auth/${provider}`;

    return window.open(
      url,
      "",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
    );
  };

  startAuth = (e) => {
    const popup = this.openPopup();

    const loop = setInterval(async () => {
      if (popup.closed) {
        clearInterval(loop);
        const user = await get("/api/whoami");
        this.props.login(user);
      }
    }, 50);
  };

  render() {
    const { provider } = this.props;
    return (
      <RoundButton
        theme="light"
        onClick={this.startAuth}
        text={
          <span>
            <FontAwesomeIcon className="NavBar-google" icon={["fab", provider]} /> Login
          </span>
        }
      />
    );
  }
}

export default OAuth;
