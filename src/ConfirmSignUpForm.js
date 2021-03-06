import React from "react";
import { Auth, I18n } from "aws-amplify";

import { Form, Icon, Input, Button, message, Row } from "antd";
import { AuthPiece } from "aws-amplify-react";

const FormItem = Form.Item;

class ConfirmSignUp extends AuthPiece {
  constructor(props) {
    super(props);
    this._validAuthStates = ["confirmSignUp"];
    this.handleSubmit = this.handleSubmit.bind(this);
    this.confirm = this.confirm.bind(this);
    this.resend = this.resend.bind(this);
    this.showComponent = this.showComponent.bind(this);
    this.state = { loading: false };
  }

  handleSubmit (e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        this.confirm();
      }
    });
  };

  confirm () {
    const username = this.usernameFromAuthData() || this.inputs.username;
    const { code } = this.inputs;
    if (!Auth || typeof Auth.confirmSignUp !== "function") {
      throw new Error(
        "No Auth module found, please ensure @aws-amplify/auth is imported"
      );
    }
    this.setState({ loading: true });
    Auth.confirmSignUp(username, code)
      .then(data => {
        this.setState({ loading: false });
        this.changeState("signIn", data);
      })
      .catch(err => {
        this.setState({ loading: false });
        message.error(err.message);
      });
  };

  resend () {
    const username = this.usernameFromAuthData() || this.inputs.username;
    if (!Auth || typeof Auth.resendSignUp !== "function") {
      throw new Error(
        "No Auth module found, please ensure @aws-amplify/auth is imported"
      );
    }

    this.setState({ loading: true });
    Auth.resendSignUp(username)
      .then(() => {
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
        message.error(typeof err === 'string' ? err : err.message);
      });
  };

  showComponent() {
    const username = this.usernameFromAuthData();
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    let {
      usernameInputProps = {},
      codeInputProps = {},
      buttonProps = {}
    } = this.props;
    usernameInputProps = {
      prefix: <Icon type="user" />,
      size: "large",
      placeholder: "Email",
      message: 'Please enter your email!',
      ...usernameInputProps,
      onChange: this.handleInputChange,
      name: "email",
      disabled: Boolean(username)
    };
    codeInputProps = {
      prefix: <Icon type="lock" />,
      size: "large",
      placeholder: "Code",
      message: 'Please enter secret code!',
      ...codeInputProps,
      onChange: this.handleInputChange,
      name: "code"
    };
    buttonProps = {
      size: 'large',
      type: 'primary',
      label: 'Submit',
      className: `antd-amplify-full-width ${buttonProps.className? buttonProps.className : ''}`,
      ...buttonProps,
      loading,
      disabled: loading,
      htmlType: 'submit'
    }

    return (
      <Form onSubmit={this.handleSubmit} className="antd-amplify-form antd-amplify-form-signup">
        <FormItem>
          {getFieldDecorator("username", {
            initialValue: username ? username : "",
            rules: [
              {
                required: true,
                type: "email",
                message: usernameInputProps.message
              }
            ]
          })(
            <Input {...usernameInputProps} />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("code", {
            rules: [
              {
                required: true,
                message: codeInputProps.message
              }
            ]
          })(
            <Input {...codeInputProps} />
          )}
        </FormItem>
        <FormItem>
          <Row type="flex" justify="space-between">
            <span>
              Back to <a onClick={() => this.changeState("signIn")}>Sign In</a>
            </span>
            <span>
              <a onClick={this.resend}>{I18n.get("Resend Code")}</a>
            </span>
          </Row>
          <Row type="flex" align="space-between">
            <Button {...buttonProps}>
              {buttonProps.label}
            </Button>
          </Row>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(ConfirmSignUp);
