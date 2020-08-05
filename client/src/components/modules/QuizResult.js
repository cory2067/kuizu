import React, { Component } from "react";
import "antd/dist/antd.css";
import "./QuizResult.css";
import { Tooltip } from "antd";

class QuizResult extends Component {
  render() {
    return this.props.studentQuiz.map((word, i) => {
      if (!word.isQuestion) return <span key={i}>{word.content}</span>;
      if (word.content === word.answer)
        return (
          <span key={i} className="QuizResult-correct">
            {word.content}
          </span>
        );
      return (
        <span key={i} className="QuizResult-incorrect">
          <Tooltip title={`Should be ${word.answer}`}>{word.content}</Tooltip>
        </span>
      );
    });
  }
}

export default QuizResult;
