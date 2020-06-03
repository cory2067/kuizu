import React, { Component } from "react";
import { post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Home.css";

import { Form, Input, Button, Radio } from "antd";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
      words: [],
    };
  }

  componentDidMount() {}

  onFinish = async (form) => {
    const res = await post("/api/generate", form);
    this.setState({
      words: res,
      code: JSON.stringify(res, null, 2),
    });
  };

  render() {
    return (
      <div>
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

            return <span key={i}>{word.content}</span>;
          })}
        </div>

        <pre>{this.state.code}</pre>
      </div>
    );
  }
}

export default Home;
