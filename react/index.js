var React=require('react');
var ReactDOM=require('react-dom');


var Comment=React.createClass({
    rawMarkup:function(){
      var md=new Remarkable();
      var rawMarkup=md.render(this.props.children.toString());
      return {__html:rawMarkup};
    },
    render:function(){
        return(
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()}></span>
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                <Comment author={comment.author} key={comment.id}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm=React.createClass({
    getInitialState:function(){
        return {author:"",text:""};
    },
    handleAuthorChange:function(e){
      this.setState({author:e.target.value});
    },
    handleTextChange:function(e){
        this.setState({text:e.target.value});
    },
    handleSubmit:function(e){
        e.preventDefault();
        var author  =this.state.author.trim();
        var text=this.state.text.trim();
        if(!text||!author){
            return;
        }
        this.props.onCommentSubmit({author:author,text:text});
        this.setState({author:"",text:""});
        this.refs.text.value="";
        this.refs.author.value="";
},
    render:function(){
        return(
            <form className="commentForm" onSubmit={this.handleSubmit} >
                <input type="text" placeholder="Your name" ref="author" onChange={this.handleAuthorChange}/>
                <input type="text" placeholder="Say something..." ref="text" onChange={this.handleTextChange}/>
                <input type="submit" value="Post"/>
            </form>
        );
    }
});


var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url+"/api",
            type:"GET",
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        console.log(newComments);
        console.log(this.state.data);
        $.ajax({
          type:"POST",
          url:this.props.url,
          dataType:'json',
            data:JSON.stringify(newComments),
            success:function(data){
              console.log(data);
              this.setState({data:data});
        }.bind(this),
           error:function(xhr,status,err){
              this.setState({data:comments});
              console.error(this.props.url,status,err.toString());
           }.bind(this)
         })
    /*    $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                console.log(data);
                //this.setState({data: data});
                this.setState({data:Object.assign({},this.state.data,data)})
                console.log(data);
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({data: comments});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });  */

    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});

ReactDOM.render(
    <CommentBox url="http://127.0.0.1:30000" pollInterval={200000}/>,document.getElementById('content')
)
