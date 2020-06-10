import React, { Component } from "react";
import KanjiChooser from "../modules/KanjiChooser";
import { get, post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Home.css";

import { Link } from "@reach/router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quizes: [],
    };
  }

  async componentDidMount() {
    const quizes = await get("/api/quizes", {});
    this.setState({ quizes });
  }

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div>
          <h1>Quiz List</h1>
          {this.state.quizes.map((quiz, i) => (
            <div key={i}>
              <Link to={`/quiz/${quiz._id}`}>{quiz.title}</Link>
            </div>
          ))}
          <Link to="/quiz/create">+ New Quiz</Link>
        </div>
      </div>
    );
  }
}

export default Home;
