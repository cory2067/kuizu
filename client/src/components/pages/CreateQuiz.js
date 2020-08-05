import React, { Component } from "react";
import KanjiEditor from "../modules/KanjiEditor";
import { post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./CreateQuiz.css";

import { Form, Input, InputNumber, Button, Radio, message } from "antd";
import { navigate } from "@reach/router";

class CreateQuiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
    };
  }

  componentDidMount() {}

  generate = async (form) => {
    const res = await post("/api/generate", { ...form, analyzer: "kuromoji" });
    console.log(res);
    this.setState({
      quizType: form.type,
      words: res,
    });
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

  onWordDelete = (content, answer) => {
    this.setState((state) => ({
      words: state.words.map((word) => {
        if (word.content === content && word.answer === answer) {
          return { content: answer, isQuestion: false };
        }
        return word;
      }),
    }));
  };

  onReadingEdit = (content, answer, newVal) => {
    this.setState((state) => ({
      words: state.words.map((word) => {
        if (word.content === content && word.answer === answer) {
          return { ...word, content: newVal };
        }
        return word;
      }),
    }));
  };

  onKanjiDelete = (content, answer, partIndex) => {
    this.setState((state) => ({
      words: state.words.map((word) => {
        if (word.content === content && word.answer === answer) {
          console.log(word);
          const parts = [...word.parts];
          parts[partIndex] = { content: parts[partIndex].answer, isQuestion: false };
          return { ...word, parts };
        }
        return word;
      }),
    }));
  };

  onKanjiEdit = (content, answer, partIndex, choiceIndex, newVal) => {
    this.setState((state) => ({
      words: state.words.map((word) => {
        if (word.content === content && word.answer === answer) {
          word.parts[partIndex].choices[choiceIndex] = newVal;
          return { ...word };
        }
        return word;
      }),
    }));
  };

  submit = async (form) => {
    await post("/api/save", {
      quiz: this.state.words,
      title: form.title,
      type: this.state.quizType,
    });
    message.success(`Created quiz ${form.title}`);
    navigate("/");
  };

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div style={{ width: 700, fontSize: 18 }}>
          <Form onFinish={this.generate} initialValues={{ type: "kanji", interval: 10 }}>
            <Form.Item label="Quiz Type" name="type" className="CreateQuiz-item">
              <Radio.Group>
                <Radio.Button value="kanji">Kanji</Radio.Button>
                <Radio.Button value="particle">Particles</Radio.Button>
                <Radio.Button value="deletion">Deletion</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="text" label="Enter some text" className="CreateQuiz-item">
              <Input.TextArea rows={5} />
            </Form.Item>

            {this.state.quizType === "deletion" && (
              <Form.Item name="interval" label="Deletion interval" className="CreateQuiz-item">
                <InputNumber min={1} />
              </Form.Item>
            )}

            <Form.Item className="CreateQuiz-item">
              <Button type="primary" htmlType="submit">
                Generate
              </Button>
            </Form.Item>
          </Form>

          <div>
            {this.state.words.map((word, i) => {
              if (!word.isQuestion) {
                return <span key={i}>{word.content}</span>;
              }

              return (
                <KanjiEditor
                  submit={this.onKanjiSubmit}
                  kanjiEdit={this.onKanjiEdit}
                  readingEdit={this.onReadingEdit}
                  wordDelete={this.onWordDelete}
                  kanjiDelete={this.onKanjiDelete}
                  key={i}
                  {...word}
                />
              );
            })}
          </div>

          {this.state.words.length > 0 && (
            <Form onFinish={this.submit}>
              <Form.Item name="title" className="CreateQuiz-item">
                <Input placeholder="Title" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="CreateQuiz-item">
                  Save
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </div>
    );
  }
}

export default CreateQuiz;
