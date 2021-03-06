import React, { Component } from 'react';
import AppLayout from '../layouts/AppLayout';

import {
  LockOutlined,
  MailOutlined
} from '@ant-design/icons';

import { Link } from "react-router-dom";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';

import { Alert, Button, Card, Checkbox, Input } from 'antd';

import { UserContext } from '../UserContext';
import './Login.less';
import api from '../helpers/Api.js';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();

    this.setState({
      loading: true,
      error: null,
    });

    this.props.form.validateFields(async (err, values) => {
      let success = false;
      if (!err) {
        console.log('Received values of form: ', values);
        
        const res = await api.login(values['email'],
                                    values['password'],
                                    values['remember']);
        if (res.code !== api.code.ok) {
          switch (res.code) {
            case -1:
              this.setState({ error: 'Incorrect password' })
              break
            case -4:
              this.setState({ error: 'Request too often' })
              break
            case -5:
              this.setState({ error: 'Email did not exist' })
              break
            default:
              this.setState({ error: 'Unknown error' })
              break
          }
        } else {
          success = true;
        }
      }

      this.setState({ loading: false });

      if (success) {
        // async function, no need to wait
        // once finished, this will cause the whole page rerender
        // then the isLoggedIn check below will handle the redirection
        this.props.userContext.toggleRefresh();
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <AppLayout page="login">
        <Card className="login-form-card">
          <Form
            name="login_form"
            className="login-form"
            onSubmit={this.handleSubmit}
            initialValues={{ remember: true }}
          >
            <Form.Item style={{ minWidth: '100%' }}>
              {getFieldDecorator('email', {
                rules: [{
                  type: 'email',
                  message: 'The input is not valid Email!',
                }, {
                  required: true,
                  message: 'Please input your Email!',
                }],
              })(
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  size="large"
                  placeholder="Email"
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  size="large"
                  type="password"
                  placeholder="Password"
                />,
              )}
            </Form.Item>
            {this.state.error ?
              <div className="red-6">{
                <Alert
                  message={this.state.error}
                  type="error"
                  closable="true"
                  showIcon />}
              </div> : null
            }
            <Form.Item style={{ marginBottom: '0px' }}>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox>Remember me</Checkbox>
              )}
              {/* TODO forgot password
                      <a href="/" className="login-form-forgot">Forgot password</a> */}
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={this.state.loading}
                // className="login-form-button"
                block
              >
                Login
                      </Button>
                      Or
                      {' '}
              <Link to="/register/">register now!</Link>
            </Form.Item>
          </Form>
        </Card>
      </AppLayout>
    );
  }
}

const WithContext = (Component) => {
  return (props) => (
      <UserContext.Consumer>
        {userContext =>  <Component {...props} userContext={userContext} />}
      </UserContext.Consumer>
  )
}

export default Form.create()(WithContext(Login));
