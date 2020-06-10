import React, { Component } from "react";
import KanjiEditor from "../modules/KanjiEditor";
import { post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
// import "./Home.css";

import { Form, Input, Button, Radio, notification } from "antd";

class CreateQuiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [],
    };
  }

  componentDidMount() {}

  generate = async (form) => {
    const res = await post("/api/generate", form);
    this.setState({
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

  submit = () => {
    console.log(this.state.words);
  };

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div style={{ width: 700, fontSize: 18 }}>
          <Form onFinish={this.generate} initialValues={{ analyzer: "kuromoji" }}>
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
          {this.state.words.length > 0 && <Button onClick={this.submit}>Save</Button>}
        </div>
      </div>
    );
  }
}

export default CreateQuiz;
