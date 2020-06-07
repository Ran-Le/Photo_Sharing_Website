import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@material-ui/core';
import './TopBar.css';
// import fetchModel from '../../lib/fetchModelData.js';
import Button from '@material-ui/core/Button';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: ""
    };

    this.logoutButtonClicked = this.logoutButtonClicked.bind(this);
  }

  logoutButtonClicked() {
    axios.post("/admin/logout", {})
    .then(this.props.changeStatus(false));
  }

    handleUploadButtonClicked = (e) => {
       e.preventDefault();
       if (this.uploadInput.files.length > 0) {

        // Create a DOM form and add the file to it under the name uploadedphoto
        const domForm = new FormData();
        domForm.append('uploadedphoto', this.uploadInput.files[0]);
        axios.post('/photos/new', domForm)
          .then((res) => {
            console.log(res);
          })
          .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  componentDidMount(){

    axios.get("http://localhost:3000/test/info")
    .then(response => response.data)
    .then(data=>this.setState({version: data.version }));

  }

  render() {
    let versionNum = "Version: " + this.state.version;

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit">
              RAN LE
          </Typography>

          <Typography className="version" variant="body1" color="inherit">
              {versionNum}
          </Typography>

          {
            this.props.userIsLoggedIn?
            <Typography className="login" variant="h5" color="inherit">
                {"Hi " + this.props.user.first_name}
            </Typography>
            :
            <Typography className="login" variant="h5" color="inherit">
                Please Login
            </Typography>
          }

          
          {this.props.userIsLoggedIn && 
            <div className="logoutButton">
              <input type="file" accept="image/*" ref={domFileRef => {this.uploadInput = domFileRef; }} />
              <Button variant="contained" onClick={this.handleUploadButtonClicked} >
                Add photo
              </Button>
              <Button variant="contained" color="secondary" onClick={this.logoutButtonClicked} >
                Logout
              </Button>
            </div>
          }
          


          <Typography className="info" variant="h5" color="inherit">
              {this.props.message}
          </Typography>

        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
