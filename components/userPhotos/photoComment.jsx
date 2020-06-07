import React from 'react';
import { MentionsInput, Mention } from 'react-mentions'
import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';

import axios from 'axios';


class PhotoComment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newComment:"",
      userPhoto: [],
      mentions:  []
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitClicked = this.submitClicked.bind(this);
    this.onMentionChange = this.onMentionChange.bind(this);

  }



  handleChange(event) {
    this.setState({ newComment: event.target.value });
  }

  onMentionChange(event, newValue, newPlainTextValue, mentions){
    this.setState({ newComment: event.target.value });
    this.setState({ mentions: mentions });
    // console.log(this.props.users);
    // console.log("mentions", mentions);
  }

  submitClicked() {
    // console.log(this.props.photo);

    axios.post("/commentsOfPhoto/" + this.props.photo._id, {
        comment: this.state.newComment,
      })
    .then(response => {
      console.log(response);
      })
    .catch(error => {
      console.log(error);
    });

    if(this.state.mentions.length){
      for(let i=0;i<this.state.mentions.length;i++)
      {
        axios.post("/mentionsOfPhoto/"+this.props.photo._id,{
          mentionedUser: this.state.mentions[i].id
        })
        .then(response => {
          console.log(response);
          })
        .catch(error => {
          console.log(error);
        });
      }
    }

    event.preventDefault();
    this.props.forceUpdate();
  }

  render() {

    return (
      <div>
        <br />

          <MentionsInput value={this.state.newComment} onChange={this.onMentionChange}>
            <Mention
              trigger="@"
              data={this.props.users}
            />
          </MentionsInput>

          <br /> <br />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            onClick = {this.submitClicked}
          >
            Submit
          </Button>
        <br /><br />
      </div>
    );
  }
}

export default PhotoComment;
