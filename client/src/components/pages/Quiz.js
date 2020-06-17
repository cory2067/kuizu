import React, { Component } from "react";
import KanjiChooser from "../modules/KanjiChooser";
import { post, get } from "../../utilities";
import { Progress } from "antd";

import "antd/dist/antd.css";
import "../../utilities.css";
//import "./Home.css";

import { Form, Input, Button, Radio, notification } from "antd";

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
    console.log(quiz);
    this.setState({
      title: quiz.title,
      words: quiz.body,
    });
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
    const result = await post("/api/submit", {
      quiz: this.state.words,
      id: this.props.id,
    });

    this.setState({ result });

    /*
    notification.open({
      message: "Quiz Result",
      description: (
        <div>
          <div>Your score: {score}</div>
          {wrong.length > 0 && (
            <>
              <div>Incorrect answers:</div>
              {wrong.map((word, i) => (
                <div key={i}>
                  {word.studentAnswer} should be {word.answer}
                </div>
              ))}
            </>
          )}
        </div>
      ),
    });
    */
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
              <Button onClick={this.grade}>Done</Button>
            </>
          ) : (
            <div className="u-textCenter">
              <h2>Your Score:</h2>
              <Progress type="circle" percent={this.state.result.score} />
              <div className="u-spacer">
                {this.state.result.wrong.map((wrong) => (
                  <div>
                    {wrong.studentAnswer} should be {wrong.answer}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Quiz;
