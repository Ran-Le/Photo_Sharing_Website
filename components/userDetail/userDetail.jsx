import React from 'react';
import {
  Typography,
  Divider
} from '@material-ui/core';
import './userDetail.css';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

// import fetchModel from '../../lib/fetchModelData.js';

import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user:[],
      mentions: [],
      userPhoto: []
    };
  }

  updateMentions(){
    let userId=this.props.match.params.userId;
    axios.get("/user/"+userId)
    .then(response => response.data)
    .then(data=>{
      this.setState({user: data,mentions:[] });
      this.props.changeMessage(this.state.user.first_name);

      axios.get("/photosOfUser/"+userId)
      .then(response => this.setState({userPhoto: response.data}))
      .catch(error=>{
        console.log(error);
        this.setState({userPhoto: []});
      });
      // console.log(this.state.user);
      if(this.state.user.mentions.length){
        for(let i=0;i<this.state.user.mentions.length;i++){
          axios.get("/getMentionedPhotos/"+this.state.user.mentions[i])
          .then(response => {
            // console.log(response.data);
            this.setState({mentions: this.state.mentions.concat(response.data) });
          });
        }
      }
    });
  }

  componentDidMount(){
    this.updateMentions();
  }

  componentDidUpdate(prevProps){
    if(this.props.userId !== prevProps.userId){
      // console.log(this.props.userId);
      this.updateMentions();
    }
  }

  render() {

    let userName = this.state.user.first_name + " " + this.state.user.last_name;
    let userLocation = this.state.user.location;
    let userDescription = this.state.user.description;
    let userOccupation = this.state.user.occupation;
    let userLink = "/photos/" + this.state.user._id;

    let recentPhoto = false;
    let commentPhoto = false;

    if(this.state.userPhoto.length)
    {
      recentPhoto = this.state.userPhoto[0];
      commentPhoto = this.state.userPhoto[0];
    }

    for(let i=0;i<this.state.userPhoto.length;i++)
    {
      if(this.state.userPhoto[i].date_time>recentPhoto.date_time)
      {
        recentPhoto=this.state.userPhoto[i];
      }
      if(this.state.userPhoto[i].comments.length>commentPhoto.comments.length)
      {
        commentPhoto=this.state.userPhoto[i];
      }
    }

    // console.log(recentPhoto);
    // console.log(commentPhoto);

    // console.log(this.state.mentions);
    let mentionList = [];

    // console.log(recentPhoto);

    if(recentPhoto)
    {
        mentionList.push(
          <div key="recent">

          <Typography variant="h6">
            Most recently uploaded photo:
          </Typography>

                <Link to={userLink}>
                <img
                  src={"/images/" + recentPhoto.file_name}
                  style={{
                    height: "auto",
                    width: "100px",
                    display: "block",
                    margin: "20px",
                  }}
                />
                </Link>

          <Typography variant="body1">
            {recentPhoto.date_time}
          </Typography>

            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
          </div>
          );
    }
    else
    {
      mentionList.push(
          <div key="noRecent">
            The user has no photo yet.
            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
          </div>
        );
    }

    if(commentPhoto && commentPhoto.comments)
    {
        mentionList.push(
          <div key="comment">

          <Typography variant="h6">
            Most commented photo:
          </Typography>

                <Link to={userLink}>
                <img
                  src={"/images/" + commentPhoto.file_name}
                  style={{
                    height: "auto",
                    width: "100px",
                    display: "block",
                    margin: "20px",
                  }}
                />
                </Link>

          <Typography variant="body1">
            {"The photo has " + commentPhoto.comments.length+" comments!"}
          </Typography>

            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
          </div>
          );
    }
    else
    {
      mentionList.push(
          <div key="noComment">
            The user has no top commented photo.
            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
          </div>
        );
    }

    if(this.state.mentions.length)
    {
        mentionList.push(
            <div key="hasMention">
              User is mentioned under following photos:
            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
            </div>
          );
      for(let i=0;i<this.state.mentions.length;i++)
      {

        let indMention = this.state.mentions[i];
        let mentionPhotoLink = "/photos/" + indMention.owner._id;
        let mentionUserLink = "/users/" + indMention.owner._id;
        mentionList.push(
          <div key={i}>

                <Link to={mentionPhotoLink}>
                <img
                  src={"/images/" + indMention.photo.file_name}
                  style={{
                    height: "auto",
                    width: "200px",
                    display: "block",
                    margin: "20px",
                  }}
                />
                </Link>

          <Button variant="contained" component={Link} to={mentionUserLink}>
          {"Owner: "+indMention.owner.first_name+" "+indMention.owner.last_name}
          </Button>
            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
          </div>
          );
      }
    }
    else
    {
      mentionList.push(
          <div key="noMention">
            Nobody mentioned the user.
          </div>
        );
    }

    return (
      <div className="cs142-userdetail">
          <Typography variant="h4">
            Name: {userName}
          </Typography>
          <Typography variant="body1">
            Location: {userLocation}
          </Typography>
          <Typography variant="body1">
            Description: {userDescription}
          </Typography>
          <Typography variant="body1">
            Occupation: {userOccupation}
          </Typography>
          <Button variant="contained" color="primary" component={Link} to={userLink}>
          Photos
          </Button>
            <br />
            <br />
            <Divider />
            <Divider />
            <Divider />
            <br />
          <Typography variant="h6">
            {mentionList}
          </Typography>
      </div>
    );
  }
}

export default UserDetail;
