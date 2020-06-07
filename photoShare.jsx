import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect 
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from "./components/loginRegister/LoginRegister";

import axios from 'axios';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      userIsLoggedIn: false,
      user: {},
      userList: [],
      message: ""
    };
    
    this.updateUserList = this.updateUserList.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.changeMessage = this.changeMessage.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  componentDidMount() {
    this.setState({ message: "" });
    this.updateUserList();
  }

  updateUserList() {
    if(this.state.userIsLoggedIn)
    {
      axios.get("/user/list")
      .then(response => response.data)
      .then(data=>this.setState({userList: data}));
    }
  }

  changeStatus(status) {
    this.setState({ userIsLoggedIn: status });
  }

  changeMessage(message) {
    this.setState({ message: message });
  }

  changeUser(user) {
    this.setState({ user: user });
  }

  render() {
    // console.log(this.state.userIsLoggedIn);
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar
            userIsLoggedIn = {this.state.userIsLoggedIn}
            changeStatus = {this.changeStatus}
            user = {this.state.user}
            message = {this.state.message}
          />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper  className="cs142-main-grid-item">
            {
              this.state.userIsLoggedIn &&
                <UserList 
                  userList = {this.state.userList}
                  updateUserList = {this.updateUserList}
                  user = {this.state.user}
                />
            }
            
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              {
                this.state.userIsLoggedIn?
                  <Route path="/users/:userId"
                    render={ props => 
                      <UserDetail 
                      {...props} 
                      userId = {props.match.params.userId}
                      message = {this.state.message}
                      changeMessage = {this.changeMessage}
                      /> }
                  />
                  :
                  <Redirect path="/users/:id" to="/login-register" />
              }
              
              {
                this.state.userIsLoggedIn?
                  <Route path="/photos/:userId"
                    render ={ props => 
                      <UserPhotos 
                      {...props} 
                      user = {this.state.user}
                      message = {this.state.message}
                      changeMessage = {this.changeMessage}
                      userList = {this.state.userList}
                      /> }
                  />
                  :
                  <Redirect path="/photos/:userId" to="/login-register" />
              }

              {
                this.state.userIsLoggedIn?
                  <Route path="/users" component={UserList}  />
                  :
                  <Redirect path="/users" to="/login-register" />
              }

              {
                this.state.userIsLoggedIn &&
                  <Redirect path="/login-register" to={"/users/" + this.state.user._id}  />
              }

              {
                this.state.userIsLoggedIn?
                  <Redirect exact path="/" to={"/users/" + this.state.user._id} />
                  :
                  <Redirect exact path="/" to="/login-register" />
              }

              <Route path="/login-register"
                    render ={ props => 
                      <LoginRegister 
                        {...props} 
                        changeUser = {this.changeUser}
                        changeStatus = {this.changeStatus}
                        changeMessage = {this.changeMessage}
                      /> 
                    }
              />

              
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
