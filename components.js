/*
Shkolovy Artem
Swrve interview task
October 2017
*/

const {
  HashRouter,
  Switch,
  Route,
  Link
} = ReactRouterDOM

const apiKey = 'vwWDtC0RoOxZCAjigupnwVHqV3Fr0Q1v',
      gifsPerPage = 25;


//Preview gif component
class Gif extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            active: false,
        };

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    };
    
     onMouseEnter() {
        this.setState(prevState => ({
            active: true
        }));
    };
    
     onMouseLeave() {
        this.setState(prevState => ({
            active: false
        }));
    };
    
    render() {
        return (
            <a href={`#/${this.props.gif.animal}/gif/${this.props.gif.id}`} className="gif-item">
                <img  onMouseEnter={this.onMouseEnter } onMouseLeave={this.onMouseLeave} 
                      className="git_item__img" src={this.state.active ? this.props.gif.url : this.props.gif.urlPrev} />
            </a>
        );
    };
};

//Paging component
const Paging = (props) => {
    return (
        <div className="paging">
            <button onClick={props.backClick} disabled={props.firstPage} className="paging-btn">
                ← Back
            </button>
            <button onClick={props.forwardClick} className="paging-btn">
                Forward →
            </button>
        </div>
    );
};

//Random cat-joke component
//taken from http://www.jokes4us.com/animaljokes/catjokes.html
const Joke = (props) => {
    //get random number (0-2)
    let num = (new Date()).getSeconds() % 3;

    return (
        <div className="joke">
            {(() => {
                switch (num) {
                  case 0:  return <span>Q: Why don't cats like online shopping? <br /> A: They prefer a cat-alogue.</span>;
                  case 1:  return <span>Q: Why are cats so good at video games? <br /> A: Because they have nine lives!</span>;
                  default: return <span>Q: What kind of sports car does a cat drive? <br /> A: A Furrari.</span>;
                }
              })()}
        </div>
    );
};

const getAnimal = param => { return param == "cat" ? "cat" : "dog"; }

//Gifs list component
class GifList extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            currentPage: 0,
            gifs: []
        };

        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleForwardClick = this.handleForwardClick.bind(this);
    };

    componentWillReceiveProps() {
        //hack: in this method route params are old (just before changing)
        let animal = this.props.match.params.animal != "cat" ? "cat" : "dog";
        this.fetchData(0, animal);
    };

    componentDidMount() {
        let animal = getAnimal(this.props.match.params.animal);
        this.fetchData(0, animal);
    };

    handleBackClick() {
        let animal = getAnimal(this.props.match.params.animal);
        this.fetchData(this.state.currentPage-1, animal);
    };

    handleForwardClick() {
        let animal = getAnimal(this.props.match.params.animal);
        this.fetchData(this.state.currentPage+1, animal);
    };

    fetchData(page, animal) {
       fetch(new Request(`http://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${animal}&limit=${gifsPerPage}&offset=${page*gifsPerPage}`, {
          mode: 'cors'
        })).then((response) => {
          return response.json();
        }).then((json) => {
            let gifs = json.data.map(d => {
                return {
                    urlPrev:  d.images.fixed_width_still.url,
                    url: d.images.fixed_width.url,
                    id: d.id,
                    animal: animal }
            });

            this.setState(prevState => ({
                currentPage: page,
                gifs: gifs
            }));
        });
    }

    render() {
        var gifs = this.state.gifs.map(gif => {
            return (
                <Gif gif={gif} />
            );
        });

      return [
        <Joke />,
        <div key="gifs" className="gifs-list">
            {gifs}
        </div>,
        <Paging key="paging" backClick={this.handleBackClick} firstPage={this.state.currentPage==0} forwardClick={this.handleForwardClick} />
        ];
    };
};

//Gif detail page component
class GifDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            url: '',
        };
    };
     
    componentDidMount() {
       fetch(new Request(`http://api.giphy.com/v1/gifs/${this.props.match.params.id}?api_key=${apiKey}`, {
            mode: 'cors',
        })).then((response) => {
          return response.json();
        }).then((json) => {
            this.setState(prevState => ({
                url: json.data.images.original.url
            }));
        });
    }
    
    render() {
        return (
            <div className="gif-detail">
                <div className="gif-detail__title">Some funny title here</div>
                <img className="gif-detail__img" src={this.state.url} />
                <input onClick={e => { e.target.select(); }} className="gif-detail__input" type="text" value={this.state.url} />
            </div>
        );
    };
};

//Header component for switching cat/dog
class AnimalHead extends React.Component {
    render(){
        let isCat = this.props.match.params.animal == "cat";

        return(
          <div className="header">
                <a href={isCat ? "#/dog" : "#/cat"} >
                    <img tooltip="Click Me!" src={isCat ? "cat-head.png" : "dog-head.png"} className="header__logo" />
                </a>
                <span className="header__title">Cats<span className="header__and">&</span>Dogs</span> 
            </div>
            );
    };
}

//Main root component
class App extends React.Component {
    render() {
        return (
          <div> 
            <Switch>
              <Route exact path='/' component={AnimalHead}/>
              <Route exact path='/:animal' component={AnimalHead}/>
              <Route path='/:animal/gif/:id' component={AnimalHead}/>
            </Switch>
            <div className="content">
                <Switch>
                  <Route exact path='/' component={GifList}/>
                  <Route exact path='/:animal' component={GifList}/>
                  <Route path='/:animal/gif/:id' component={GifDetail}/>
                </Switch>
            </div>
          </div>
        );
    };
};

ReactDOM.render(<HashRouter><App /></HashRouter>, document.getElementById("app"));
