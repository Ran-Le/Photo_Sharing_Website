import React from "react";
import { Typography,Divider } from "@material-ui/core";
import axios from "axios";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_name: "took",
      password: "weak",
      login_error: "",
      register_error: "",

      register_login_name: "",
      register_password: "",
      register_password2: "",
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRegist = this.handleRegist.bind(this);
  }

  componentDidMount(){
    this.props.changeMessage("");
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    // console.log(this.state);
    
    axios.post("/admin/login", {
        login_name: this.state.login_name,
        password: this.state.password
      })
    .then(response => {
        this.props.changeUser(response.data);
        this.props.changeStatus(true);
      })
    .catch(error => {
      console.log(error);
      this.setState({login_error: "Incorrect user or password."});
    });

    event.preventDefault();
  }

  handleRegist(event) {
    // console.log(this.state);
    if (
      this.state.register_login_name &&
      this.state.register_password &&
      this.state.register_password2 &&
      this.state.first_name &&
      this.state.last_name &&
      this.state.location &&
      this.state.description &&
      this.state.occupation
    )
    {
      if(this.state.register_password !== this.state.register_password2 )
      {
        this.setState({register_error: "Passwords not match"});
      }
      else
      {
        axios.post("/user", {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation,
            login_name: this.state.register_login_name,
            password: this.state.register_password,
          })
        .then(response => {
          console.log(response)
          this.setState({
            register_login_name: "",
            register_password: "",
            register_password2: "",
            first_name: "",
            last_name: "",
            location: "",
            description: "",
            occupation: "",
            register_error: "User Created Successfully"
            });
        })
        .catch(error => {
          this.setState({register_error: error.response.data});
        });
      }
    }
    else
    {
      this.setState({register_error: "Please fill in all information"});
    }
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <div>
          <Typography variant="h5">
              Login
          </Typography>
          <form onSubmit={this.handleSubmit}>
            <div>
            <TextField  type="text" label="User Name" name="login_name" value={this.state.login_name || ""} onChange={this.handleChange} />
            </div>
            <div>
            <TextField label="Password" type="password" name="password" value={this.state.password || ""} onChange={this.handleChange} />
            </div>
        <br />
            <Button variant="contained" color="primary" type="submit" value="Submit">
              login
            </Button>
            <Typography variant="subtitle2">
                {this.state.login_error}
            </Typography>
          </form>
        </div>

        <br />
        <br />
        <Divider />
        <Divider />
        <Divider />

        <br />
        <br />

        <div>
          <Typography variant="h5">
              Registration
          </Typography>
          <form onSubmit={this.handleRegist}>
            <div>
            <TextField type="text" label="User Name" name="register_login_name" value={this.state.register_login_name || ""} onChange={this.handleChange} />
            </div>
            <div>
            <TextField type="password" label="Password" name="register_password" value={this.state.register_password || ""} onChange={this.handleChange} />
            </div>
            <div>
            <TextField type="password" label="Confirm Password" name="register_password2" value={this.state.register_password2 || ""} onChange={this.handleChange} />
            </div>
            <div>
            <TextField type="text" label="First Name" name="first_name" value={this.state.first_name || ""} onChange={this.handleChange} />
            </div>
            <div>
            <TextField type="text" label="Last Name" name="last_name" value={this.state.last_name || ""} onChange={this.handleChange} />
            </div>
            <div>
            <TextField type="text" label="Location" name="location" value={this.state.location || ""} onChange={this.handleChange} fullWidth />
            </div>
            <div>
            <TextField type="text" label="Description" name="description" value={this.state.description || ""} onChange={this.handleChange} fullWidth />
            </div>
            <div>
            <TextField type="text" label="Occupation" name="occupation" value={this.state.occupation || ""} onChange={this.handleChange} fullWidth />
            </div>
        <br />
            <Button variant="contained" color="primary" type="submit" value="Submit">
              register
            </Button>
            <Typography variant="subtitle2">
                {this.state.register_error}
            </Typography>
          </form>
        </div>

      </div>
      );
  }
}

export default LoginRegister;