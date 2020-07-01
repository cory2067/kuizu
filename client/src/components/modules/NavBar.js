import React, { Component } from "react";
import { Location, Link, Router, navigate } from "@reach/router";
import AuthController from "./AuthController";
import RoundButton from "./RoundButton";

import "./NavBar.css";

class NavBar extends Component {
  render() {
    return (
      <div className="NavBar-container">
        <div className="NavBar-left">
          <Link to="/" className="NavBar-link">
            <h1>Japanese Quiz</h1>
          </Link>
        </div>
        <div className="NavBar-right">
          {this.props.user._id && (
            <span className="NavBar-welcome">Welcome, {this.props.user.firstName}</span>
          )}
          <AuthController
            setUser={this.props.setUser}
            logout={this.props.logout}
            loggedIn={this.props.user._id}
            providers={["google"]}
          />
        </div>
      </div>
    );
  }
}

/**
 * Higher order component to give the NavBar access to location
 */
const NavBarWithLocation = (props) => {
  return (
    <Location>
      {({ location }) => {
        return <NavBar location={location} {...props} />;
      }}
    </Location>
  );
};

export default NavBarWithLocation;
