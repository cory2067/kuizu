import React, { Component } from "react";
import { get, post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Home.css";

import { Tooltip } from "antd";

import { Link } from "@reach/router";

class Manage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scores: [],
      quiz: { title: "loading..." },
    };
  }

  async componentDidMount() {
    const { scores, quiz } = await get("/api/scores", { quiz: this.props.id });
    this.setState({
      scores,
      quiz,
    });
  }

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div>
          <h1>Grades for {this.state.quiz.title}</h1>
          <div>
            {this.state.scores.length === 0 && <div>Nobody has completed this quiz yet</div>}
            {this.state.scores.map((score) => (
              <div key={score._id}>
                <Tooltip
                  title={score.wrong.map((w) => `${w.studentAnswer} (${w.answer})`).join(", ")}
                >
                  {score.student.firstName} {score.student.lastName}: {score.grade}%
                </Tooltip>
              </div>
            ))}
          </div>

          <div>
            <span className="u-bold">Quiz Link: </span>
            <Link
              to={`/quiz/${this.props.id}`}
            >{`${window.location.origin}/quiz/${this.props.id}`}</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Manage;
