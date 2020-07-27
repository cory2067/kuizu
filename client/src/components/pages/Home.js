import React, { Component } from "react";
import { get, post, delet } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Home.css";

import { Link } from "@reach/router";
import { Table, Popconfirm, Radio, Button } from "antd";
const { Column } = Table;

import { LinkOutlined, BarChartOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const compare = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quizes: [],
      show: "mine",
    };
  }

  async componentDidMount() {
    const quizes = await get("/api/quizes", {});

    this.sortList(quizes);
    this.setState({ quizes });
  }

  sortList = (quizes) => {
    // sort so that your own quizes are listed first
    const mine = (quiz) => quiz.creator._id === this.props.user._id;
    return quizes.sort((a, b) => {
      if (mine(a) && !mine(b)) return -1;
      if (!mine(a) && mine(b)) return 1;
      return 0;
    });
  };

  delete = async (id) => {
    await delet("/api/quiz", { id });
    this.setState((state) => ({
      quizes: state.quizes.filter((q) => q._id !== id),
    }));
  };

  handleFilter = (event) => {
    const show = event.target.value;
    this.setState({ show });
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.user._id && this.props.user._id) {
      const quizes = this.sortList([...this.state.quizes]);
      this.setState({ quizes });
    }
  }

  render() {
    let quizes = this.state.quizes;
    if (this.props.user.isTeacher && this.state.show === "mine") {
      quizes = quizes.filter((q) => q.creator._id === this.props.user._id);
    }

    return (
      <div className="u-flex-justifyCenter">
        <div>
          <h1 className="Home-header"></h1>
          {this.props.user.isTeacher && (
            <div className="Home-admin-panel">
              <Link to="/quiz/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  New Quiz
                </Button>
              </Link>
              <div className="Home-quiz-selector">
                <span>Quizzes Shown: </span>
                <Radio.Group value={this.state.show} onChange={this.handleFilter}>
                  <Radio.Button value="mine">Mine</Radio.Button>
                  <Radio.Button value="all">All</Radio.Button>
                </Radio.Group>
              </div>
            </div>
          )}
          <Table dataSource={quizes}>
            <Column
              title="Title"
              dataIndex="title"
              key="title"
              sorter={(a, b) => compare(a.title, b.title)}
            />
            <Column
              title="Creator"
              dataIndex="creator"
              key="creator"
              sorter={(a, b) => compare(a.creator.lastName, b.creator.lastName)}
              render={(user) => (
                <span>
                  {user.firstName} {user.lastName}
                </span>
              )}
            />
            <Column
              title="Date Created"
              dataIndex="timestamp"
              key="timestamp"
              sorter={(a, b) => compare(new Date(a.timestamp), new Date(b.timestamp))}
              render={(date) => new Date(date).toLocaleDateString("en-US")}
            />
            <Column
              title="Quiz Link"
              dataIndex="_id"
              key="quiz"
              render={(id) => (
                <div className="Home-button">
                  <Link to={`/quiz/${id}`}>
                    <LinkOutlined />
                  </Link>
                </div>
              )}
            />
            {this.props.user.isTeacher && (
              <Column
                title="Results"
                dataIndex="_id"
                key="results"
                render={(id) => (
                  <div className="Home-button">
                    <Link to={`/manage/${id}`}>
                      <BarChartOutlined />
                    </Link>
                  </div>
                )}
              />
            )}
            {this.props.user.isTeacher && (
              <Column
                title="Delete"
                dataIndex="_id"
                key="delete"
                render={(id) => (
                  <div className="Home-button">
                    <Popconfirm
                      title="Are you sure delete this quiz?"
                      onConfirm={() => this.delete(id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <a>
                        <DeleteOutlined />
                      </a>
                    </Popconfirm>
                  </div>
                )}
              />
            )}
          </Table>
        </div>
      </div>
    );
  }
}

export default Home;
