import React, { Component } from 'react';
import './style.scss';
import { browserHistory, Link } from 'react-router';
import HorizantalScrollList from '../../components/HorizantalScrollList';

class Home extends Component {
  
   // static propTypes = { }
   // static defaultProps = {}
   state = {
      sourceList: [],
      sourceValue: '',
      selectedSource: {},
      sortByValue: '',
      sortByValueList: [],
      categoryValue: '',
      countryValue: '',
      countryList: [],
      categoryList: [],
      loadingSource: true,
      sortBySource: '',
      nextSelectSource:{}
   }
  
  constructor(props) {
      super(props);

      this.NewsApiHost = 'https://newsapi.org/v1/';
    //   this.NewsApiHost = 'https://127.0.0.1';
      this.NewsSourceApiUrl = `${this.NewsApiHost}sources?language=en`;

      this.sourcesData = [];
      this.countryNameWithCode = {
          au: 'Australia',
          it: 'Italy',
          gb: 'United Kingdom',
          in: 'India',
          us: 'United States of America'
      };
      this.toggleCategory = true;
      this.toggleCountry = true;
  }

  _getSource() {
      return fetch(this.NewsSourceApiUrl).then(res => res.json(), this._errorHandler);
  }

  componentWillMount() {
    
    browserHistory.listen( location =>  {
    //    var params=
    });       
  }

  componentWillReceiveProps (nextProps) {
      const { source_id, source_sortBy } = nextProps.params;
      if(source_id !== this.props.params.source_id) {
          this._updateStateOnLocationChange(source_id, source_sortBy);
      }
  }
  
  componentDidMount() {
        this._getSource().then(source_data => {
            const { sources } = source_data;
            this.sourcesData = sources;
            
            const categoriesWithUnique =  sources.map(source=>{
                return source.category;
            }).filter((source,index,self)=>{
                return index === self.indexOf(source);
            });

            const countriesWithUnique =  sources.map(country=>{
                return country.country;
            }).filter((country,index,self)=>{
                return index === self.indexOf(country);
            });

            this.setState({
                countryList: countriesWithUnique,
                sourceList: sources,
                loadingSource: false,
                categoryList: categoriesWithUnique
            });     
            this._selectDefaultSourceOrWithParams(this.props.params);
        });
  }
  
  _selectDefaultSourceOrWithParams(params) {
    const { source_id, source_sortBy } = params;
    const sources = this.sourcesData;
    let selectedSource = sources[1] || {};
    let sortBySource = selectedSource.sortBysAvailable.includes('latest') ? 'latest' : 'top';
    let nextSelectSource = sources.length > 2 ? sources[2] : {};
    // get source by params value
    if(source_id && source_sortBy) {
        sources.forEach((source_by_id, index)=>{
            if(source_by_id.id === source_id) {
                selectedSource = source_by_id;
                sortBySource = source_by_id.sortBysAvailable.includes(source_sortBy) ? source_sortBy : source_by_id.sortBysAvailable[0]
                const nextIndex = index + 1;
                nextSelectSource = sources.length > nextIndex ? sources[nextIndex] : {};
            }
        });
    }
    this.setState({
        sourceValue: selectedSource.id,
        selectedSource,
        sortBySource,
        nextSelectSource
    });
  }

  _updateStateOnLocationChange(source_id, source_sortBy) {
    const { sourceList } = this.state;
    let nextSelectSource = {};
    const source_by_id = sourceList.filter((source, index)=>{
        if(source.id === source_id) {
            const nextIndex = index + 1;
            nextSelectSource = sourceList.length > nextIndex ? sourceList[nextIndex] : {};
            return true;
        }
    })[0];
    // source_by_id is not undifined
    if(source_by_id) {
        const { sortBysAvailable } = source_by_id;
        source_sortBy = sortBysAvailable.includes(source_sortBy) ? source_sortBy : sortBysAvailable[0];
        this.setState({
            sourceValue: source_id,
            sortBySource: source_sortBy,
            selectedSource: source_by_id,
            nextSelectSource,
            isSortByOpen: false
        });
    } else {
        this._selectDefaultSourceOrWithParams({source_id, source_sortBy});
    }
    window.scroll(0,0);
  }

  onSourceChange(source) {
    let sortBySource = source.sortBysAvailable.includes('latest') ? 'latest' : 'top';
    browserHistory.push(`${source.id}/${sortBySource}`);
  }

  onCategoryChange(value) {
    if(this.state.categoryValue === value) {
        this.toggleCategory = false;
    } else {
        this.toggleCategory = true;
    }

    const sourceByCategory = this.sourcesData.filter(source=>{
        if(this.state.countryValue) {
            if(!this.toggleCategory) {
                return source.country === this.state.countryValue;
            }
            return source.category === value && source.country === this.state.countryValue;
        } else {
            if(!this.toggleCategory) {
                return true;
            }
            return source.category === value;
        }
    });

    this.setState({
        sourceList: sourceByCategory || [],
        categoryValue: this.toggleCategory && value
    });
  }

  onCountryChange(value) {
    if(this.state.countryValue === value) {
        this.toggleCountry = false;
    } else {
        this.toggleCountry = true;
    }
    const sourceByCountry = this.sourcesData.filter(source=>{
       if(this.state.categoryValue) {
           if(!this.toggleCountry){
               return source.category === this.state.categoryValue;
           }
           return source.country === value;
       } else {
           if(!this.toggleCountry) {
               return true;
           }
           return source.country === value;
       }
    });

    this.setState({
        sourceList: sourceByCountry || [],
        countryValue: this.toggleCountry && value,
    });
  }
  
  resetCountrySelect() {
        let souceListFilterData = this.sourcesData;
        const { categoryValue } = this.state;
        if(categoryValue) {
            souceListFilterData = this.sourcesData.filter(source=>{
                return source.category === categoryValue;
            });
        }
        this.setState({
            countryValue: '',
            sourceList: souceListFilterData
        });
  }
  resetCategorySelect() {
        let souceListFilterData = this.sourcesData;
        const { countryValue } = this.state;
        if(countryValue) {
            souceListFilterData = this.sourcesData.filter(source=>{
                return source.country === countryValue;
            });
        }
        this.setState({
            categoryValue: '',
            sourceList: souceListFilterData
        });
  }

  filterSourcesByValue(event) {
      const value = event.target.value;
      const copySourceData = [].concat(this.sourcesData);
      const filteredSources =  copySourceData.filter(source=>{
          return source.id.indexOf(value) !== -1 || source.name.indexOf(value) !== -1;
      });
      this.setState({
          sourceList: filteredSources
      });
  }

  render() {
    const { loadingSource, sortBySource, countryList, categoryList, sourceList, sourceValue, selectedSource, countryValue, categoryValue, nextSelectSource } = this.state;

    // render child component with parent props
    function renderChildren(props, apiHostUrl, selectedSource, sortBySource, nextSelectSource, onSourceChange) {
        return React.Children.map(props.children, child => {
                    return React.cloneElement(child, {
                        apiHostUrl,
                        selectedSource,
                        sortBySource,
                        nextSelectSource,
                        onSourceChange
                    })
                });
    }

    return (
        <div className="nhh">
            <header className="nhh__header">
                <section className="container">
                    <img className="logo-img" src="./logo.png" alt="NHH" />
                    <Link to="/"><span className="brand-name">News Headlines Hunt</span></Link>
                </section>
            </header>
            <nav className="nhh__nav-filter">
            <div className="nhh__nav-filter__tab nhh__nav-filter__tab--country">
                    <HorizantalScrollList classNameValue="nhh__nav-filter__tab--country__list">
                        {
                            countryList.map(countryChip=>
                                <li className={countryChip === countryValue ? 'active' : ''} onClick={this.onCountryChange.bind(this, countryChip)}>
                                        <span className="text-uppercase">{ this.countryNameWithCode[countryChip] }</span>
                                </li>
                            )
                        }
                    </HorizantalScrollList>
            </div>
            <div className="nhh__nav-filter__tab nhh__nav-filter__tab--category">
                <HorizantalScrollList classNameValue="nhh__nav-filter__tab--category__list">
                    {
                        categoryList.map(categoyChip=>
                            <li className={categoyChip === categoryValue ? 'active' : ''} onClick={this.onCategoryChange.bind(this, categoyChip)}>
                                <span className="text-uppercase">{categoyChip}</span>
                            </li>
                        )
                    }
                </HorizantalScrollList>
            </div>
            <div className="nhh__nav-filter__tab--source">
                <HorizantalScrollList classNameValue="nhh__nav-filter__tab--source__list">
                        {
                            sourceList.map((source, index)=>
                                <li className={source.id === sourceValue ? 'active' : ''} onClick={this.onSourceChange.bind(this, source, index)}>
                                    <div style={`background-image:url(${source.urlsToLogos.medium})`} className="filter__tab--source__box">
                                    </div>
                                    <div className="filter__tab--source__label">
                                        <span>{source.name}</span>
                                    </div>
                                </li>
                            ) 
                        }
                        {
                            (!loadingSource && !sourceList.length) && <li className="empty-source"><span className="text-brand">No news source available</span></li>
                        }
                </HorizantalScrollList>
            </div>
            </nav>
            {renderChildren(this.props, this.NewsApiHost, selectedSource, sortBySource, nextSelectSource, this.onSourceChange.bind(this))}
            <footer className="nhh__footer">
                <section>
                    <span>Made by </span> <a href="https://satyamdev.firebaseapp.com" target="blank"><b>Satyam Dev</b></a>
                    <div>
                        <span>news powered by </span><a href="https://newsapi.org" target="blank"><b>newsapi.org</b></a>
                    </div>
                </section>
            </footer>
      </div>
    );
  }
}

export default Home;
