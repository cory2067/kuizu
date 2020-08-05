import React, { Component } from "react";
import { get, post } from "../../utilities";
import QuizResult from "../modules/QuizResult";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Manage.css";

import { Tooltip, Table, Modal, Button } from "antd";
import { FormOutlined, DownloadOutlined } from "@ant-design/icons";
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

  showScore = (studentQuiz) => {
    Modal.info({
      title: "Quiz Response",
      content: <QuizResult studentQuiz={studentQuiz} />,
      onOk() {},
    });
  };

  download = () => {
    const scores = this.state.scores.map((s) => ({
      ...s,
      wrong: [
        ...new Set(
          s.studentQuiz
            .filter((w) => w.isQuestion && w.answer !== w.content)
            .map((w) => `${w.content} (${w.answer})`)
        ),
      ].join(", "),
    }));

    const header = "Student,Score,Quiz Title,Quiz Type,Timestamp,Incorrect Answers";
    const body = scores
      .map(
        (s) =>
          `${s.student.firstName} ${s.student.lastName},${s.grade},${this.state.quiz.title},${this.state.quiz.type},${s.timestamp},"${s.wrong}"`
      )
      .join("\n");

    const dl = document.createElement("a");
    dl.href = "data:text/csv;chartset=utf-8," + encodeURIComponent(`${header}\n${body}`);
    dl.target = "_blank";
    dl.download = `quiz-${this.state.quiz._id}.csv`;
    dl.click();
  };

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div>
          <div className="Manage-header">
            <h1>Grades for {this.state.quiz.title} </h1>
            <Button
              type="primary"
              shape="circle"
              icon={<DownloadOutlined />}
              onClick={this.download}
            />
          </div>
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
              dataIndex="studentQuiz"
              key="details"
              render={(studentQuiz) => (
                <div className="Manage-button">
                  <FormOutlined onClick={() => this.showScore(studentQuiz)} />
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
