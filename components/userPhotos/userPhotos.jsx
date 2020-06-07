import React from 'react';
import {
  Typography,
  Divider
} from '@material-ui/core';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
// import fetchModel from '../../lib/fetchModelData.js';
import PhotoComment from "./photoComment";

import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhoto:[],
      user:[],
      users: [],
      placeholder: 0
    };
    this.forceUpdate = this.forceUpdate.bind(this);
  }

  forceUpdate(){
    this.setState({placeholder:1});
    let userId=this.props.match.params.userId;
    axios.get("/photosOfUser/"+userId)
    .then(response => this.setState({userPhoto: response.data}))
    .catch(error=>console.log(error));
  }

  componentDidMount(){
    let userId=this.props.match.params.userId;
    axios.get("/photosOfUser/"+userId)
    .then(response => this.setState({userPhoto: response.data}))
    .catch(error=>console.log(error));
    this.props.changeMessage("Photos of "+ this.props.message);
    this.setState({user:this.props.user});

    let modUserList=[];
    for(let i=0;i<this.props.userList.length;i++)
    {
      let curUser = this.props.userList[i];
      let id = curUser._id;
      let display = curUser.first_name+" "+curUser.last_name;
      let temp = {id:id,display:display};
      modUserList.push(temp);
    }

    this.setState({users:modUserList});

  }

  render() {
    let photoList = [];

    for(let i = 0; i < this.state.userPhoto.length; i++)
    {
      let photo = this.state.userPhoto[i];
      photoList.push(
        <div key={photo._id}>
          <img src={"/images/"+photo.file_name} />
          <Typography variant="body2">
            Time: {photo.date_time}
          </Typography>
          <Typography variant="h6">
            Comments
          </Typography>
          <Divider />
        </div>
        );

      if(photo.comments)
      {
        let commentList = [];
        for(let j = 0; j < photo.comments.length; j++)
        {
          let currentComment = photo.comments[j];
          let currentLink = "/users/" + currentComment.user._id;
          let userName = currentComment.user.first_name + " " + currentComment.user.last_name;
          commentList.push(
              <div key={currentComment._id}>
                <Typography variant="body1">
                  {currentComment.comment} 
                </Typography>
                <Typography variant="body2">
                  {currentComment.date_time}
                </Typography>

                <Button component={Link} to={currentLink}  onClick={this.props.handler}>
                  {userName}
                </Button>

                <Divider />

              </div>
            );
        }

        photoList.push(
            <div key={photo._id+"comments"}>
              {commentList}
            </div>
          );
      }
      photoList.push(
          <div key={photo._id+"divider"}>
            <PhotoComment
              photo={photo}
              updatePhotoList={this.updatePhotoList}
              userId={this.props.match.params.userId}
              users = {this.state.users}
              forceUpdate = {this.forceUpdate}
            />
            <Divider />
            <Divider />
            <Divider />
            <br />
            <br />
            <br />
          </div>
        );
    }


    return (
      <div className="cs142-userphotos">
        {photoList}
      </div>
    );
  }
}

export default UserPhotos;
