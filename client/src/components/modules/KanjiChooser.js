import React, { Component } from "react";
import "antd/dist/antd.css";
import "./KanjiChooser.css";
import { Popover, Radio, Button, Form } from "antd";
import FormItem from "antd/lib/form/FormItem";

class KanjiChooser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  onFinish = (form) => {
    this.setState({
      visible: false,
    });

    this.props.submit(this.props.content, this.props.answer, form);
  };

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  };

  render() {
    return (
      <Popover
        content={
          <Form onFinish={this.onFinish}>
            <div className="KanjiChooser-container">
              {this.props.parts.map((part, i) => {
                if (!part.isQuestion) {
                  return (
                    <div key={i} className="KanjiChooser-row">
                      {part.content}
                    </div>
                  );
                }

                return (
                  <Form.Item key={i} name={i}>
                    <Radio.Group className="KanjiChooser-row">
                      {part.choices.map((choice, i) => (
                        <Radio.Button key={i} className="KanjiChooser-radio" value={choice}>
                          {choice}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                );
              })}
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        }
        title={this.props.original}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <span
          className={`KanjiChooser-word ${
            this.props.completed ? "KanjiChooser-complete" : "KanjiChooser-incomplete"
          }`}
        >
          {this.props.content}
        </span>
      </Popover>
    );
  }
}

export default KanjiChooser;
