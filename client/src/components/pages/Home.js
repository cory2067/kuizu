import React, { Component } from "react";
import KanjiChooser from "../modules/KanjiChooser";
import { post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Home.css";

import { Form, Input, Button, Radio, notification } from "antd";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
    };
  }

  componentDidMount() {}

  onFinish = async (form) => {
    const res = await post("/api/generate", form);
    this.setState({
      words: res,
    });
    console.log(res);
  };

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
          <Form onFinish={this.onFinish} initialValues={{ analyzer: "kuromoji" }}>
            <Form.Item label="Analyzer" name="analyzer">
              <Radio.Group>
                <Radio.Button value="kuromoji">Kuromoji</Radio.Button>
                <Radio.Button value="mecab">Mecab</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="text" label="Enter some text">
              <Input.TextArea />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>

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

export default Home;
