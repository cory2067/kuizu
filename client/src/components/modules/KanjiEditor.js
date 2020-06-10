import React, { Component } from "react";
import "antd/dist/antd.css";
import "./KanjiEditor.css";
import { Popover, Input, Button } from "antd";

class KanjiEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  };

  onWordDelete = () => {
    this.props.wordDelete(this.props.content, this.props.answer);
  };

  onKanjiDelete = (part) => {
    this.props.kanjiDelete(this.props.content, this.props.answer, part);
  };

  onEdit = (e, part, choice) => {
    const val = e.target.value;
    this.props.kanjiEdit(this.props.content, this.props.answer, part, choice, val);
  };

  onReadingChange = (e) => {
    const val = e.target.value;
    this.props.readingEdit(this.props.content, this.props.answer, val);
  };

  render() {
    return (
      <Popover
        content={
          <div className="u-flexColumn">
            <div className="KanjiEditor-container">
              {this.props.parts.map((part, partIndex) => {
                if (!part.isQuestion) {
                  return (
                    <div key={partIndex} className="KanjiChooser-row">
                      {part.content}
                    </div>
                  );
                }

                return (
                  <div className="KanjiEditor-row">
                    <Button
                      type="default"
                      className="KanjiEditor-spaced"
                      danger
                      onClick={() => this.onKanjiDelete(partIndex)}
                    >
                      X
                    </Button>
                    {part.choices.map((choice, i) => (
                      <Input
                        key={i}
                        value={choice}
                        className={`KanjiEditor-input ${
                          choice === part.answer ? "KanjiEditor-correct" : ""
                        }`}
                        maxLength={1}
                        onChange={(e) => this.onEdit(e, partIndex, i)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            <Button
              type="default"
              className="KanjiEditor-spaced"
              danger
              onClick={this.onWordDelete}
            >
              Remove
            </Button>
            <Button
              type="primary"
              className="KanjiEditor-spaced"
              onClick={() => this.handleVisibleChange(false)}
            >
              Close
            </Button>
          </div>
        }
        title={<Input value={this.props.content} onChange={this.onReadingChange} />}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <span className={`KanjiEditor-word`}>{this.props.content}</span>
      </Popover>
    );
  }
}

export default KanjiEditor;
