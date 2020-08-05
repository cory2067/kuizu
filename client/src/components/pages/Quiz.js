import React, { Component } from "react";
import KanjiChooser from "../modules/KanjiChooser";
import QuizResult from "../modules/QuizResult";
import { post, get, formatParams } from "../../utilities";
import { Progress } from "antd";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Quiz.css";

import { Tooltip, Button } from "antd";
import { SoundOutlined } from "@ant-design/icons";

class Quiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Loading...",
      words: [],
      result: null,
    };
  }

  async componentDidMount() {
    const quiz = await get("/api/quiz", { id: this.props.id });

    this.setState({
      title: quiz.title,
      audio: quiz.audio,
      words: quiz.body.map((word) => ({ ...word, original: word.content })),
    });

    if (this.props.user._id) {
      const score = await get("/api/score", { quiz: this.props.id, student: this.props.user._id });
      if (score.grade) this.setState({ result: score });
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.user._id !== this.props.user._id) {
      if (!this.props.user._id) {
        this.setState({ result: null });
      } else {
        const score = await get("/api/score", {
          quiz: this.props.id,
          student: this.props.user._id,
        });
        if (score.grade) this.setState({ result: score });
      }
    }
  }

  onKanjiSubmit = (content, realAnswer, studentAnswer) => {
    this.setState((state) => ({
      words: state.words.map((word) => {
        // make sure the kana and the correct kanji both match
        if (word.content === content && word.answer === realAnswer) {
          const parts = word.parts.map((part, i) => ({
            ...part,
            studentAnswer: studentAnswer[i] || part.content,
          }));
          const content = parts.map((p) => p.studentAnswer).join("");
          return { ...word, content, parts, completed: true };
        }
        return word;
      }),
    }));
  };

  grade = async () => {
    const result = await post("/api/score", {
      quiz: this.state.words,
      id: this.props.id,
    });

    this.setState({ result });
  };

  playAudio = async () => {
    window.open(
      `/api/audio?${formatParams({ id: this.props.id })}`,
      "popup",
      "width=200,height=100"
    );
  };

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div style={{ width: 700, fontSize: 18 }}>
          <h1>{this.state.title}</h1>
          {this.state.result === null ? (
            <>
              <div>
                {this.state.words.map((word, i) => {
                  if (!word.isQuestion) {
                    return <span key={i}>{word.content}</span>;
                  }

                  return <KanjiChooser submit={this.onKanjiSubmit} key={i} {...word} />;
                })}
              </div>

              <div className="Quiz-buttons">
                {this.state.audio && (
                  <Button onClick={this.playAudio}>
                    <SoundOutlined /> Play Audio
                  </Button>
                )}
                <Button type="primary" onClick={this.grade} disabled={!this.props.user._id}>
                  {this.props.user._id ? "Submit" : "Log in to submit"}
                </Button>
              </div>
            </>
          ) : (
            <div className="u-textCenter">
              <h2>Your Score:</h2>
              <Progress type="circle" status="active" percent={this.state.result.grade} />
              <div className="u-spacer">
                <QuizResult {...this.state.result} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Quiz;
