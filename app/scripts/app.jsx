'use strict';

var $ = jQuery;
var React = window.react = require('react/addons');
var Reflux = require('reflux');

var userStore = require('./stores/userStore');
var postActions = require('./actions/postActions');
// var userActions = require('./actions/userActions');
// var historyActions = require('./actions/historyActions');

// Routing
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
// var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;

// var TransitionGroup = React.addons.CSSTransitionGroup;

// Views
var Posts = require('./views/posts');
var SinglePost = require('./views/single');
var Register = require('./views/register');
var Login = require('./views/login');
var Profile = require('./views/profile');

var ReactNews = React.createClass({

    mixins: [Reflux.connect(userStore, 'user')],

    getInitialState: function() {
        return {
            user: userStore.getDefaultData(),
            hideMenu: true
        };
    },


    // componentWillMount: function () {
    //     userActions.resolveUser();
    // },

    componentDidMount: function () {
        // hide the menu when clicked away
        $(document).on('touchend click', function (e) {
            var d = e.target;

            // if this node is not the one we want, move up the dom tree
            while (d !== null && d.id !== 'header-panel' && d.id !== 'panel-toggle') {
                d = d.parentNode;
            }

            // at this point we have found our containing div or we are out of parent nodes
            var insideMyDiv = (d !== null && (d.id === 'header-panel'|| d.id === 'panel-toggle'));

            if (!this.state.hideMenu && !insideMyDiv) {
                this.toggleMenu();
            }
        }.bind(this));
    },

    toggleMenu: function () {
        this.setState({
            hideMenu: !this.state.hideMenu
        });
    },

    submitPost: function (e) {
        e.preventDefault();

        var titleEl = this.refs.title.getDOMNode();
        var linkEl = this.refs.link.getDOMNode();

        var user = this.state.user;
        var post = {
            title: titleEl.value.trim(),
            url: linkEl.value.trim(),
            creator: user.profile.username,
            creatorUID: user.uid
        };

        postActions.submitPost(post);

        titleEl.value = '';
        linkEl.value = '';
        this.toggleMenu();
    },

    render: function() {
        var cx = React.addons.classSet;
        var menuHidden = this.state.hideMenu;
        var user = this.state.user;

        var loggedIn = !!user.uid;
        var username = user ? user.profile.username : '';
        var md5hash = user ? user.profile.md5hash : '';

        var headerCx = cx({
            'header': true,
            'panel-open': !menuHidden
        });

        var userInfoCx = cx({
            'user-info': true,
            'hidden': !loggedIn
        });

        return (
            <div className="wrapper">
                <header className={ headerCx }>
                    <div className="header-main">
                        <div className="float-left">
                            <Link to="home" className="button menu-title">react-news</Link>
                        </div>
                        <div className="float-right">
                            <span className={ loggedIn ? 'hidden' : '' }>
                                <Link to="login" className="button">Sign In</Link>
                                <Link to="register" className="button">Register</Link>
                            </span>
                            <div className={ userInfoCx }>
                                <Link to="profile" params={{ userId: user.uid }} className="profile-link">
                                    { username }
                                    <img src={'http://www.gravatar.com/avatar/' + md5hash } className="nav-pic" />
                                </Link>
                            </div>
                            <a id="panel-toggle" className="panel-toggle" onClick={ this.toggleMenu }>
                                <span>menu</span>
                            </a>
                        </div>
                    </div>
                    <div id="header-panel" className="header-panel text-center">
                        <form onSubmit={ this.submitPost } className="panel-form">
                            <input type="text" className="panel-input" placeholder="Title" ref="title" />
                            <input type="url" className="panel-input" placeholder="Link" ref="link" />
                            <button type="submit" className="button button-panel">Submit</button>
                        </form>
                    </div>
                </header>
                <this.props.activeRouteHandler user={ this.state.user } />
            </div>
        );
    }
});

var routes = (
    <Routes location="history">
        <Route handler={ ReactNews }>
            <Route name="post" path="/post/:postId" handler={ SinglePost } />
            <Route name="register" path="/register" handler={ Register } />
            <Route name="login" path="/login" handler={ Login } />
            <Route name="profile" path="/:userId" handler={ Profile } />
            <DefaultRoute name="home" handler={ Posts } />
        </Route>
    </Routes>
);

    // 

React.render(routes, document.getElementById('app'));
