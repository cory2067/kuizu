import React, { Component } from "react";
import { get, post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Manage.css";

import { Tooltip, Table, Modal } from "antd";
import { FormOutlined } from "@ant-design/icons";
const { Column } = Table;

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

  showScore = (wrong) => {
    Modal.info({
      title: "Incorrect Answers",
      content: (
        <div>
          {wrong.map((w) => (
            <p>
              {w.studentAnswer} (should be {w.answer})
            </p>
          ))}
        </div>
      ),
      onOk() {},
    });
  };

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div>
          <h1>Grades for {this.state.quiz.title}</h1>
          <Table dataSource={this.state.scores}>
            <Column
              title="Student"
              dataIndex="student"
              key="student"
              render={(student) => `${student.firstName} ${student.lastName}`}
            />
            <Column title="Grade" dataIndex="grade" key="grade" render={(grade) => `${grade}%`} />
            <Column
              title="Details"
              dataIndex="wrong"
              key="details"
              render={(wrong) => (
                <div className="Manage-button">
                  <FormOutlined onClick={() => this.showScore(wrong)} />
                </div>
              )}
            />
          </Table>

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
