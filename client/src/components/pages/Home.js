import React, { Component } from "react";
import { get, post } from "../../utilities";

import "antd/dist/antd.css";
import "../../utilities.css";
import "./Home.css";

import { Link } from "@reach/router";
import { Table } from "antd";
const { Column } = Table;

import { LinkOutlined, BarChartOutlined, PlusOutlined } from "@ant-design/icons";

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
    };
  }

  async componentDidMount() {
    const quizes = await get("/api/quizes", {});
    this.setState({ quizes });
  }

  render() {
    return (
      <div className="u-flex-justifyCenter">
        <div>
          <h1 className="Home-header">Quiz List</h1>
          {this.props.user.isTeacher && (
            <Link to="/quiz/create">
              <PlusOutlined /> New Quiz
            </Link>
          )}
          <Table dataSource={this.state.quizes}>
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
              render={(user) => `${user.firstName} ${user.lastName}`}
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
          </Table>
        </div>
      </div>
    );
  }
}

export default Home;
