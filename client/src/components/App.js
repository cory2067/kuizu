import React, { Component } from "react";
import { Router } from "@reach/router";
import NavBar from "./modules/NavBar";
import NotFound from "./pages/NotFound.js";
import Home from "./pages/Home.js";
import Quiz from "./pages/Quiz.js";
import Manage from "./pages/Manage.js";
import CreateQuiz from "./pages/CreateQuiz.js";

import "../utilities.css";

import { get } from "../utilities";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fab, fas);
/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      words: [],
    };
  }

  async componentDidMount() {
    const user = await get("/api/whoami");
    this.setUser(user);
  }

  setUser = (user) => {
    this.setState({ user });
  };

  handleLogout = () => {
    this.setState({ user: {} });
  };

  render() {
    return (
      <>
        <NavBar user={this.state.user} setUser={this.setUser} logout={this.handleLogout} />
        <Router primary={false}>
          <Home path="/" user={this.state.user} />
          <CreateQuiz path="/quiz/create" user={this.state.user} />
          <Quiz path="/quiz/:id" user={this.state.user} />
          <Manage path="/manage/:id" user={this.state.user} />
          <NotFound default />
        </Router>
      </>
    );
  }
}

export default App;
