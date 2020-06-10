import React, { Component } from "react";
import KanjiChooser from "../modules/KanjiChooser";
import { post, get } from "../../utilities";

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
          const content = word.parts.map((part, i) => studentAnswer[i] || part.content).join("");
          return { ...word, content, completed: true };
        }
        return word;
      }),
    }));
  };

  grade = () => {
    const total = this.state.words.filter((word) => word.isQuestion);
    const wrong = total
      .filter((word) => word.answer !== word.content)
      .map((word) => `${word.content} (correct: ${word.answer})`);

    notification.open({
      message: "Quiz Result",
      description: (
        <div>
          <div>Your score: {100 - Math.round((100 * wrong.length) / total.length)}</div>
          {wrong.length > 0 && (
            <>
              <div>Incorrect answers:</div>
              {wrong.map((text, i) => (
                <div key={i}>{text}</div>
              ))}
            </>
          )}
        </div>
      ),
    });
  };

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div style={{ width: 700, fontSize: 18 }}>
          <h1>{this.state.title}</h1>
          <div>
            {this.state.words.map((word, i) => {
              if (!word.isQuestion) {
                return <span key={i}>{word.content}</span>;
              }

              return <KanjiChooser submit={this.onKanjiSubmit} key={i} {...word} />;
            })}
          </div>
          <Button onClick={this.grade}>Done</Button>
        </div>
      </div>
    );
  }
}

export default Quiz;
