import React, { Component } from "react";
import RoundButton from "./RoundButton";
import { get } from "../../utilities";
import OAuth from "./OAuth";

/**
 * Proptypes
 * @param {(user) => void} setUser: (function) login user
 * @param {(user) => void} logout: (function) logout user
 * @param {boolean} loggedIn: is user loggedIn
 * @param {string[]} providers: providers for oauth
 */

class AuthController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
  }

  login = (user) => {
    this.props.setUser(user);
  };

  logout = () => {
    console.log("logging out...");
    get("/auth/logout").then(() => {
      this.props.logout();
    });
  };

  render() {
    const { loggedIn, disabled, providers } = this.props;
    const providersList = providers.map((provider) => (
      <OAuth key={provider} login={this.login} provider={provider} disabled={disabled} />
    ));

    return (
      <>
        {loggedIn ? (
          <RoundButton theme="light" onClick={this.logout} text="Logout" />
        ) : (
          <>{providersList}</>
        )}
      </>
    );
  }
}

export default AuthController;
