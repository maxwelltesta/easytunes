/** USER CARD
 * Component within Search List Card
 * Used to display a user in the search results 
 */

import React, { Component } from 'react'
// Received for Pending request from user. Shared for pending request to user ## RiUserUnfollowLine
import {RiUserFollowLine, RiUserAddLine,RiUserReceivedLine,RiUserSharedLine} from 'react-icons/ri'

class UserCard extends Component {
    state = { 
        user: this.props.user,
        sessionUserRequests: null,
        sessionUserFollowers: null,
        loading: true,
    }

    // Get the user 
    componentDidMount = () => {
        this.setState({loading: true})
        let requestBody = {
            query: `
                query {
                    getUserByUsername(username: "${this.props.sessionUser}"){
                        user {
                            _id
                            follow_requests {
                                user_id
                                username
                            }
                            followers {
                                user_id 
                                username
                            }
                        }
                    }
                }
            `
        }

        fetch("http://localhost:5000/graphql", {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'content-type': 'application/json'
                }
            })
            .then(res => {
                if (res.status !== 200 && res.status !== 201)
                    throw new Error ('Failed')
                return res.json()
            })
            .then(data => {
                this.setState({
                    sessionUserRequests : data.data.getUserByUsername.user.follow_requests,
                    sessionUserFollowers : data.data.getUserByUsername.user.followers,
                    loading: false 
                })
            })
            .catch(error => {
                console.log(error)
            })
    }

    // If the session user has made a follow request 
    userRequestedFollow = () => {
        const requests = this.state.user.user.follow_requests

        let requested = false
        requests.forEach(request => {
            if (request.username === this.props.sessionUser)
                requested = true 
          
        })
        return requested
    }

    // If the searched user has made a follow request 
    searchedRequestedFollow = () => {
        let requested = false 
        this.state.sessionUserRequests.forEach(request => {
            if (request.username === this.state.user.user.username)
                requested = true
        })
        return requested
    }

    // If the searched user is following 
    searchedFollowing = () => {
        let following = false 
        this.state.sessionUserFollowers.forEach(follower => {
            if (follower.username === this.state.user.user.username)
                following = true
        })
        return following 
    }

    // If the session user is following searched user 
    userFollowing = () => {
        let following = false 
        this.state.user.user.followers.map(follower => {
            if (follower.username === this.props.sessionUser)
                following = true
        })
        return following 
    }

    // Send a follow request 
    sendRequest = () => {
        console.log(this.state.user.user._id)
        let requestBody = {
            query: `
                mutation {
                 
                    addRequest(id: "${this.state.user.user._id}", requested_username: "${this.props.sessionUser}"){
                            _id
                            username
                            followers {
                                user_id
                                username
                            }
                            follow_requests {
                                user_id 
                                username
                            }

                    }
                }
            `
        }
        fetch("http://localhost:5000/graphql", {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'content-type': 'application/json'
                }
            })
            .then(res => {
                if (res.status !== 200 && res.status !== 201)
                    throw new Error ('Failed')
                return res.json()
            })
            .then(data => {
            console.log(data)
                let user = this.state.user 
                user.user = data.data.addRequest
       
               this.setState({user: user})
            })
            .catch(error => {
                console.log(error)
            })

    }

    // Go to the user's profile page 
    toUser = () => {
        console.log(this.props)
        this.props.history.push('/' +  this.state.user.user.username)
    }
    render() { 
        if (this.state.loading)
            return (<> </>);
        // Do not show in the search results if it's the user that's logged in 
        if (this.props.sessionUser === this.state.user.user.username)
            return (<> </>);
        return(
            <div>
                <div className='card z-depth-0 text'>
                    <div className='card-content col s3 user-button'>
                        <button onClick = {this.toUser}><span className='card-title'>{this.state.user.user.username}</span> </button>
                    </div>
                    <div className='card-content col s3'>
                        <span className='card-title'>{this.state.user.user.followers.length}</span>
                    </div>
                    <div className='card-content col s3'>
                        <span className='card-title'>{this.state.user.playlists.length}</span>
                    </div>

                    <div className='card-content col s3 user-follow-info'>
                        {this.userRequestedFollow() ?  <RiUserSharedLine size= {24}/> : 
                         this.userFollowing() ? <RiUserFollowLine size= {24}/> : 
                         this.searchedRequestedFollow() ? <RiUserReceivedLine size= {24}/>:
                         <button onClick={this.sendRequest}> <RiUserAddLine size= {24}/> </button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
 
export default UserCard;