import React from "react"
import "antd/dist/antd.css";
import { Alert, Input, Button } from "antd";
import {LoadingOutlined, LeftOutlined, RightOutlined, SearchOutlined} from "@ant-design/icons";

import './App.css';
import {searchMovie} from "./omdbApi.js";
import config, {getFromLocalStorage, setFromLocalStorage} from "./config.js"

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      nominees: [],
      searchedMovies: [],
      page: 1,
      maxPages: 0,
      query: "",
      queryToUse: "",
      searching: false
    }
    this.onSearch = this.onSearch.bind(this);
  }

  /**
   * Queries movies based on title.
   * @param {*} switchPage True if we want to switch from one page
   *                       to the next without changing the query string.
   *                       False if we want to make a new query, resetting
   *                       page to 1.
   * @param {*} desiredPage The page to query
   */
  onSearch(switchPage = false, desiredPage = 1) {
    const page = switchPage ? desiredPage : 1;
    const query = switchPage ? this.state.queryToUse : this.state.query;

    this.setState({ searching: true });
    if (!switchPage) {
      this.setState({ queryToUse: query });
    }

    searchMovie(query, page)
      .then((resp) => {
        this.setState({
          searchedMovies: resp.Search || [],
          searching: false,
          maxPages: resp.Response === "True" ? Math.ceil(resp.totalResults/10) : 0,
          page: page
       });
      })
      .catch((error) => {
        this.setState({searching: false});
      });
  }

  componentDidMount() {
    const storedNominees = getFromLocalStorage("config#nominations", []);
    this.setState({ nominees: storedNominees });
  }

  // Search bar to search movies
  renderSearchBar() {
    return(
      <div className="search-bar">
        <div className="search-bar-title">Movie Title</div>
        <Input
          placeholder="search movies"
          prefix={<SearchOutlined/>}
          value={this.state.query}
          onChange={(e) => this.setState({ query: e.target.value })}
          onPressEnter={(e) => this.onSearch()}
        />
      </div>
    );
  }

  // Displays a movie with an action (nominate or remove)
  renderMovie(key, movie, action) {
    const {Title, Year, Poster} = movie;
    return(
      <div className="movie" key={key}>
        {(Poster?.startsWith("http://") || Poster?.startsWith("https://")) &&
          (<img className="movie-img" src={Poster} alt={Title}/>)}
        <div className="movie-content">
          <div className="movie-title">{`${Title} (${Year})`}</div>
          {action || ""}
        </div>
      </div>
    );
  }

  // Checks if a movie is already nominated or if max nominations is exceeded
  canNotNominate(movie) {
    if (this.state.nominees.length >= config.MAX_NOMINATIONS) {
      return true;
    }

    if (this.state.nominees.findIndex((nominee) => nominee.imdbID === movie.imdbID) !== -1) {
      return true;
    }

    return false;
  }

  // Nominate button for each listed movie
  renderNominateButton(movie) {
    return(
      <Button
        className="clickable action-button"
        type="primary"
        disabled={this.canNotNominate(movie)}
        onClick={(e) => {
          const updatedNominees = [...this.state.nominees, movie];
          this.setState({ nominees: updatedNominees });
          setFromLocalStorage("config#nominations", updatedNominees);
        }}
      >
        Nominate
      </Button>
    );
  }

  // Displays the arrow keys to switch between pages
  renderPageSwitch() {
    return(
      <div className="switch-page">
        <span style={{flex: 'auto'}} />
        <Button
          disabled={this.state.page - 1 < 1}
          onClick={(e) => this.onSearch(true, this.state.page - 1)}
        >
          <LeftOutlined/>
        </Button>
        <h3 style={{margin: "0 10px 0 10px" }}>{`${this.state.page}/${this.state.maxPages}`}</h3>
        <Button
          disabled={this.state.page + 1 > this.state.maxPages}
          onClick={(e) => this.onSearch(true, this.state.page + 1)}
        >
          <RightOutlined/>
        </Button>
      </div>
    );
  }  

  // List of movies to search
  renderMovieList() {
    // Title displays message to send to user
    let title = "";
    if (this.state.searching) {
      title = (<>
        <span>{`Searching ${this.state.queryToUse}`}</span>
        <LoadingOutlined/>
      </>)
    } else if (this.state.queryToUse === "") {
      if (this.state.query === "") {
        title = (
          <span>{`Nothing searched yet.`}</span>
        );
      } else {
        title = (
          <span>{`Press ENTER to search "${this.state.query}"`}</span>
        )
      }
    } else if (this.state.maxPages <= 0) {
      title = (
        <span>{`Nothing matches "${this.state.queryToUse}".`}</span>
      );
    } else {
      title=(
        <span>{`Results for ${this.state.queryToUse}`}</span>
      )
    }

    return(
      <div>
        <div className="section-title">{title}</div>
        {
          this.state.maxPages > 1 &&
          <div>{this.renderPageSwitch()}</div>
        }
        {this.state.searchedMovies.map((movie) => this.renderMovie(
          `search#${movie.imdbID}`, movie, this.renderNominateButton(movie)
        ))}
      </div>
    );
  }

  // Button to remove a nominee
  renderRemoveButton(movie) {
    return(
      <Button
        className="clickable action-button"
        type="primary"
        onClick={(e) => {
          const updatedNominees = this.state.nominees.filter(
            (nominee) => nominee.imdbID !== movie.imdbID
          );
          this.setState({ nominees: updatedNominees });
          setFromLocalStorage("config#nominations", updatedNominees);
        }}
      >
        Remove
      </Button>
    );
  }

  // List of movie nominees
  renderNomineeList() {
    return(
      <div>
        <div className="section-title">{`Nominations (${this.state.nominees.length}/${config.MAX_NOMINATIONS})`}</div>
        {this.state.nominees.map((movie) => this.renderMovie(
          `nominee#${movie.imdbID}`, movie, this.renderRemoveButton(movie)
        ))}
      </div>
    );
  }

  render () {
    return (
      <div className="App">
        {
          this.state.nominees.length === config.MAX_NOMINATIONS &&
          <Alert message="You have now selected all 5 nominees." type="success" banner />
        }
        <div className="App-title">The Shoppies</div>
        
        <div 
          className="section"
          style={{margin: "8px 0 8px 0"}}
        >
          {this.renderSearchBar()}
        </div>

        <div style={{display: "flex"}}>
          <div
            className="section"
            style={{ width: "50%", margin: "32px 16px 32px 0" }}
          >
            {this.renderMovieList()}
          </div>
          <div
            className="section"
            style={{ width: "50%", margin: "32px 0 32px 16px" }}
          >
            {this.renderNomineeList()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
