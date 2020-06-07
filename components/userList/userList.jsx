import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@material-ui/core';
import './userList.css';

import { Link } from 'react-router-dom';
// import fetchModel from '../../lib/fetchModelData.js';


/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.updateUserList();
  }

  componentDidUpdate(){
    this.props.updateUserList();
  }

  render() {
    let showList = [];

    for(let i = 0; i < this.props.userList.length; i++)
    {
      let userName = this.props.userList[i].first_name + " " + this.props.userList[i].last_name;
      let userLink = "/users/" + this.props.userList[i]._id;
      let userAct = this.props.userList[i].latest_act;
      showList.push(
        <div key={this.props.userList[i]._id}>
          <ListItem button component={Link} to={userLink}>
            <ListItemText 
            primary={userName} 
            secondary={
              userAct&&userAct.includes(".")?
              (<span>
                <span>
                Posted a photo
                </span>
                <img
                  src={"/images/" +userAct}
                  style={{
                    height: "auto",
                    width: "50px",
                    display: "block",
                    margin: "10px"
                  }}
                />
                </span>)
              :
              (userAct)
            }
            />
          </ListItem>
          <Divider />
        </div>
        );
    }

    return (
      <div className="cs142-userlist">
        <Typography variant="h4">
          User Names
        </Typography>
        <List component="nav">
          {showList}
        </List>
      </div>
    );
  }
}

export default UserList;
